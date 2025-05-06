"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Loader2, AlertCircle, Home, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOrderById } from "@/lib/order-api"
import type { Order } from "@/lib/types"
import { logError } from "@/lib/debug-utils"
import SiteHeader from "@/components/site-header"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      router.push("/")
      return
    }

    const fetchOrder = async () => {
      try {
        setIsLoading(true)
        const orderData = await getOrderById(orderId)
        setOrder(orderData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "获取订单详情失败"
        setError(errorMessage)
        logError("获取订单详情失败", { orderId, error: err })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  if (!orderId) {
    return null // 等待重定向
  }

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">正在加载订单信息...</p>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">获取订单失败</h1>
                <p className="text-gray-500 mb-6">{error}</p>
                <div className="flex space-x-4">
                  <Button asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      返回首页
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">订单提交成功</h1>
                <p className="text-gray-500 mb-6">感谢您的购买！您的订单已成功提交，订单号：{orderId}</p>

                {order && (
                  <div className="w-full mb-8">
                    <div className="border rounded-lg p-4 mb-4">
                      <h2 className="font-semibold mb-2">订单信息</h2>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">订单编号</div>
                        <div>{order.id}</div>
                        <div className="text-gray-500">订单状态</div>
                        <div>{order.status === "pending" ? "待付款" : order.status}</div>
                        <div className="text-gray-500">创建时间</div>
                        <div>{new Date(order.createdAt).toLocaleString()}</div>
                        <div className="text-gray-500">支付方式</div>
                        <div>
                          {order.paymentMethod === "wechat"
                            ? "微信支付"
                            : order.paymentMethod === "alipay"
                              ? "支付宝"
                              : "货到付款"}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 mb-4">
                      <h2 className="font-semibold mb-2">收货信息</h2>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">收货人</div>
                        <div>{order.address.name}</div>
                        <div className="text-gray-500">联系电话</div>
                        <div>{order.address.phone}</div>
                        <div className="text-gray-500">收货地址</div>
                        <div className="col-span-2">
                          {order.address.province} {order.address.city} {order.address.district} {order.address.address}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h2 className="font-semibold mb-2">商品信息</h2>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex items-center space-x-3">
                            <div className="relative h-12 w-12 flex-shrink-0">
                              <Image
                                src={item.productImage || "/placeholder.svg"}
                                alt={item.productName}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.productName}</p>
                              <p className="text-sm text-gray-500">
                                ¥{item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">¥{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-between pt-3 border-t font-semibold">
                          <span>订单总计</span>
                          <span className="text-rose-600">¥{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button asChild variant="outline">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      返回首页
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/orders">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      查看我的订单
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
