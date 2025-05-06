"use client"

import { useState, useEffect, useRef } from "react"
import { X, Minus, Plus, Loader2, AlertCircle } from "lucide-react"
import type { Product, Comment } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import CommentList from "./comment-list"
import { useCart } from "@/context/cart-context"
import { fetchProductReviews, fetchProductById } from "@/lib/api"
import { logInfo, logWarning, logError } from "@/lib/debug-utils"
import Image from "next/image"

interface ProductDetailsProps {
  productId: string
  isOpen: boolean
  onClose: () => void
  allProducts: Product[]
}

export default function ProductDetails({ productId, isOpen, onClose, allProducts }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [productError, setProductError] = useState<{ message: string; details?: any } | null>(null)
  const [commentsError, setCommentsError] = useState<{ message: string; details?: any } | null>(null)
  const [networkInfo, setNetworkInfo] = useState<{
    commentsStartTime?: Date
    commentsEndTime?: Date
    commentsDuration?: number
    commentsStatus?: string
  }>({})
  const { addToCart } = useCart()

  // 添加一个ref来跟踪评论是否已经加载过
  const commentsLoadedRef = useRef<boolean>(false)
  // 添加一个ref来跟踪当前产品ID，用于重置评论加载状态
  const prevProductIdRef = useRef<string | null>(null)

  // 防止模态框打开时页面滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      logInfo("打开产品详情模态框", { productId })
    } else {
      document.body.style.overflow = "auto"
      logInfo("关闭产品详情模态框")
      // 重置评论加载状态
      commentsLoadedRef.current = false
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, productId])

  // 当产品ID变化时，重置评论加载状态
  useEffect(() => {
    if (productId !== prevProductIdRef.current) {
      commentsLoadedRef.current = false
      prevProductIdRef.current = productId
      setComments([])
      setCommentsError(null)
    }
  }, [productId])

  // 获取产品详情
  useEffect(() => {
    if (isOpen && productId) {
      const loadProductDetails = async () => {
        try {
          setIsLoadingProduct(true)
          setProductError(null)

          logInfo("开始从本地产品列表获取产品详情", {
            productId,
            availableProducts: allProducts.length,
          })

          // 从已加载的产品列表中获取产品详情
          const productData = await fetchProductById(productId, allProducts)
          setProduct(productData)
          setQuantity(1) // 重置数量

          logInfo("成功获取产品详情", { product: productData })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "未知错误"

          logError("获取产品详情失败", {
            productId,
            error: err,
            availableProductIds: allProducts.map((p) => p.id),
          })

          setProductError({
            message: "加载产品详情失败",
            details: errorMessage,
          })
        } finally {
          setIsLoadingProduct(false)
        }
      }

      loadProductDetails()
    }
  }, [isOpen, productId, allProducts])

  // 修改获取产品评论的useEffect钩子，确保不会重复请求
  useEffect(() => {
    // 只有在以下条件全部满足时才加载评论：
    // 1. 模态框是打开的
    // 2. 有产品ID
    // 3. 当前标签是评论标签
    // 4. 评论尚未加载过
    if (isOpen && productId && activeTab === "comments" && !commentsLoadedRef.current) {
      const loadComments = async () => {
        try {
          setIsLoadingComments(true)
          setCommentsError(null)

          const startTime = Date.now()
          setNetworkInfo({
            commentsStartTime: new Date(startTime),
            commentsStatus: "正在加载评论...",
          })

          logInfo("开始获取产品评论", { productId })

          const commentsData = await fetchProductReviews(productId)

          const endTime = Date.now()
          setNetworkInfo({
            commentsStartTime: new Date(startTime),
            commentsEndTime: new Date(endTime),
            commentsDuration: endTime - startTime,
            commentsStatus: "成功",
          })

          setComments(commentsData)
          // 标记评论已加载
          commentsLoadedRef.current = true

          logInfo("成功获取产品评论", {
            productId,
            commentCount: commentsData.length,
            duration: `${endTime - startTime}ms`,
          })

          if (commentsData.length === 0) {
            logWarning("产品评论为空", { productId })
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "未知错误"

          setNetworkInfo({
            commentsStartTime: networkInfo.commentsStartTime,
            commentsEndTime: new Date(),
            commentsDuration: networkInfo.commentsStartTime
              ? Date.now() - networkInfo.commentsStartTime.getTime()
              : undefined,
            commentsStatus: "失败",
          })

          logError("获取产品评论失败", { productId, error: err })

          setCommentsError({
            message: "加载评论失败",
            details: errorMessage,
          })

          // 即使失败也标记为已尝试加载，防止无限重试
          commentsLoadedRef.current = true
        } finally {
          setIsLoadingComments(false)
        }
      }

      loadComments()
    }
  }, [isOpen, productId, activeTab]) // 移除了networkInfo.commentsStartTime依赖项

  // 手动重试加载评论的函数
  const handleRetryLoadComments = () => {
    // 重置加载状态，允许重新加载
    commentsLoadedRef.current = false
    setIsLoadingComments(true)
    logInfo("手动重试加载评论", { productId })

    fetchProductReviews(productId)
      .then((data) => {
        setComments(data)
        setCommentsError(null)
        logInfo("重试成功，已加载评论", { count: data.length })
        // 标记为已加载
        commentsLoadedRef.current = true
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "未知错误"
        setCommentsError({
          message: "加载评论失败",
          details: errorMessage,
        })
        logError("重试加载评论失败", { error: err })
        // 即使失败也标记为已尝试
        commentsLoadedRef.current = true
      })
      .finally(() => setIsLoadingComments(false))
  }

  const handleAddToCart = () => {
    if (product) {
      logInfo("添加产品到购物车", {
        productId: product.id,
        productName: product.name,
        quantity,
      })

      addToCart(product, quantity)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 模态框内容 */}
      <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="relative h-12 bg-white border-b">
          <button onClick={onClose} className="absolute right-4 top-3 text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
            <span className="sr-only">关闭</span>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-3rem)]">
          {isLoadingProduct ? (
            <div className="flex flex-col justify-center items-center p-20">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400 mb-4" />
              <span className="text-gray-500">加载产品详情中...</span>
            </div>
          ) : productError ? (
            <div className="text-center p-20">
              <div className="inline-flex items-center bg-red-50 text-red-500 px-4 py-2 rounded-lg mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                {productError.message}
              </div>

              {productError.details && (
                <div className="mt-2 mb-4 p-4 bg-gray-50 rounded-lg max-w-lg mx-auto text-left text-sm text-gray-700 overflow-auto">
                  <div className="font-medium mb-1">错误详情:</div>
                  <pre className="whitespace-pre-wrap break-words">{productError.details}</pre>
                </div>
              )}

              <Button onClick={() => onClose()}>关闭</Button>
            </div>
          ) : product ? (
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* 产品图片显示部分 */}
              <div className="relative h-80 md:h-96 w-full rounded-md overflow-hidden">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <p className="text-rose-600 text-xl font-bold mb-4">¥{product.price.toFixed(2)}</p>

                <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">商品详情</TabsTrigger>
                    <TabsTrigger value="comments">用户评论</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-gray-700">{product.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">品牌</div>
                        <div>{product.brand}</div>
                        <div className="text-gray-500">库存</div>
                        <div>{product.stock} 件</div>
                        <div className="text-gray-500">分类</div>
                        <div>{product.category}</div>
                      </div>

                      {/* 数量选择器 */}
                      <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
                        <div className="flex items-center">
                          <button
                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                            className="w-10 h-10 flex items-center justify-center border rounded-l-md"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-16 text-center border-t border-b h-10 flex items-center justify-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                            className="w-10 h-10 flex items-center justify-center border rounded-r-md"
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button className="w-full" onClick={handleAddToCart}>
                          加入购物车
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-4">
                    {isLoadingComments ? (
                      <div className="flex flex-col justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                        <span className="text-gray-500">加载评论中...</span>

                        {networkInfo.commentsStartTime && (
                          <div className="mt-2 text-xs text-gray-400">
                            开始时间: {networkInfo.commentsStartTime.toLocaleTimeString()}
                            <br />
                            状态: {networkInfo.commentsStatus}
                            <br />
                            已等待: {Math.floor((Date.now() - networkInfo.commentsStartTime.getTime()) / 1000)}秒
                          </div>
                        )}
                      </div>
                    ) : commentsError ? (
                      <div className="text-center py-10">
                        <div className="inline-flex items-center bg-red-50 text-red-500 px-4 py-2 rounded-lg mb-4">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          {commentsError.message}
                        </div>

                        {commentsError.details && (
                          <div className="mt-2 mb-4 p-4 bg-gray-50 rounded-lg max-w-lg mx-auto text-left text-sm text-gray-700 overflow-auto">
                            <div className="font-medium mb-1">错误详情:</div>
                            <pre className="whitespace-pre-wrap break-words">{commentsError.details}</pre>
                          </div>
                        )}

                        {networkInfo.commentsStartTime && (
                          <div className="mb-4 text-sm text-gray-500">
                            <div>请求开始时间: {networkInfo.commentsStartTime.toLocaleTimeString()}</div>
                            {networkInfo.commentsEndTime && (
                              <div>请求结束时间: {networkInfo.commentsEndTime.toLocaleTimeString()}</div>
                            )}
                            {networkInfo.commentsDuration && <div>请求耗时: {networkInfo.commentsDuration}ms</div>}
                            <div>状态: {networkInfo.commentsStatus}</div>
                          </div>
                        )}

                        <Button variant="outline" size="sm" onClick={handleRetryLoadComments}>
                          重试
                        </Button>
                      </div>
                    ) : (
                      <CommentList comments={comments} />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="text-center p-20">
              <div className="text-gray-500 mb-4">未找到产品信息</div>
              <Button onClick={() => onClose()}>关闭</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
