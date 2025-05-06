"use client"

import { useState, useEffect } from "react"
import ProductGrid from "@/components/product-grid"
import CartSidebar from "@/components/cart-sidebar"
import PaginationControls from "@/components/pagination"
import { fetchProducts } from "@/lib/api"
import type { Product } from "@/lib/types"
import { Loader2, AlertCircle } from "lucide-react"
import DebugPanel from "@/components/debug-panel"
import { logInfo, logError, logWarning } from "@/lib/debug-utils"
import SiteHeader from "@/components/site-header"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center">精选商品</h2>
        <ProductGridWithPagination />
      </main>

      <CartSidebar />
      <DebugPanel />
    </>
  )
}

// 带分页功能的产品网格组件
function ProductGridWithPagination() {
  const [currentPage, setCurrentPage] = useState(1)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ message: string; details?: any } | null>(null)
  const [networkInfo, setNetworkInfo] = useState<{
    startTime?: Date
    endTime?: Date
    duration?: number
    status?: string
  }>({})
  const productsPerPage = 8 // 每页显示8个产品

  // 从API获取所有产品
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)
        setNetworkInfo({ startTime: new Date(), status: "正在连接..." })

        logInfo("开始加载产品数据")

        const startTime = Date.now()
        const products = await fetchProducts()
        const endTime = Date.now()

        setNetworkInfo({
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          duration: endTime - startTime,
          status: "成功",
        })

        logInfo(`成功加载了 ${products.length} 个产品`, {
          duration: `${endTime - startTime}ms`,
          firstProduct: products.length > 0 ? products[0] : null,
        })

        if (products.length === 0) {
          logWarning("API返回了空的产品列表")
        }

        setAllProducts(products)

        // 计算总页数
        const calculatedTotalPages = Math.ceil(products.length / productsPerPage)
        setTotalPages(calculatedTotalPages)

        logInfo(`计算分页信息`, {
          totalProducts: products.length,
          productsPerPage,
          totalPages: calculatedTotalPages,
        })

        // 设置第一页显示的产品
        updateDisplayedProducts(products, 1)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "未知错误"

        setNetworkInfo({
          startTime: networkInfo.startTime,
          endTime: new Date(),
          duration: networkInfo.startTime ? Date.now() - networkInfo.startTime.getTime() : undefined,
          status: "失败",
        })

        logError("加载产品失败", { error: err })

        setError({
          message: "加载产品失败，请稍后再试",
          details: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [productsPerPage])

  // 当页码变化时更新显示的产品
  useEffect(() => {
    if (allProducts.length > 0) {
      updateDisplayedProducts(allProducts, currentPage)
    }
  }, [currentPage, allProducts])

  // 更新当前页显示的产品
  const updateDisplayedProducts = (products: Product[], page: number) => {
    const startIndex = (page - 1) * productsPerPage
    const endIndex = page * productsPerPage
    const pageProducts = products.slice(startIndex, endIndex)

    logInfo(`更新当前页显示的产品`, {
      page,
      startIndex,
      endIndex,
      displayedProductsCount: pageProducts.length,
    })

    setDisplayedProducts(pageProducts)
  }

  // 页面变化处理函数
  const handlePageChange = (page: number) => {
    logInfo(`页码变化`, { from: currentPage, to: page })
    setCurrentPage(page)
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400 mb-4" />
        <span className="text-gray-500">加载中...</span>
        {networkInfo.startTime && (
          <div className="mt-2 text-xs text-gray-400">
            开始时间: {networkInfo.startTime.toLocaleTimeString()}
            <br />
            状态: {networkInfo.status}
            <br />
            已等待: {Math.floor((Date.now() - networkInfo.startTime.getTime()) / 1000)}秒
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center bg-red-50 text-red-500 px-4 py-2 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error.message}
        </div>

        {error.details && (
          <div className="mt-2 mb-4 p-4 bg-gray-50 rounded-lg max-w-lg mx-auto text-left text-sm text-gray-700 overflow-auto">
            <div className="font-medium mb-1">错误详情:</div>
            <pre className="whitespace-pre-wrap break-words">{error.details}</pre>
          </div>
        )}

        {networkInfo.startTime && (
          <div className="mb-4 text-sm text-gray-500">
            <div>请求开始时间: {networkInfo.startTime.toLocaleTimeString()}</div>
            {networkInfo.endTime && <div>请求结束时间: {networkInfo.endTime.toLocaleTimeString()}</div>}
            {networkInfo.duration && <div>请求耗时: {networkInfo.duration}ms</div>}
            <div>状态: {networkInfo.status}</div>
          </div>
        )}

        <button
          onClick={() => {
            // 重新加载产品
            logInfo("手动重试加载产品")
            setIsLoading(true)
            fetchProducts()
              .then((products) => {
                setAllProducts(products)
                updateDisplayedProducts(products, currentPage)
                setError(null)
                logInfo("重试成功，已加载产品", { count: products.length })
              })
              .catch((err) => {
                const errorMessage = err instanceof Error ? err.message : "未知错误"
                setError({
                  message: "加载产品失败，请稍后再试",
                  details: errorMessage,
                })
                logError("重试加载产品失败", { error: err })
              })
              .finally(() => setIsLoading(false))
          }}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <>
      <ProductGrid products={displayedProducts} allProducts={allProducts} />
      <div className="flex justify-center">
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </>
  )
}
