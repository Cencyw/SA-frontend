"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, CreditCard, Truck, AlertCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AddressForm from "@/components/address-form"
import type { Address, OrderFormData, OrderItem } from "@/lib/types"
import { submitOrder } from "@/lib/order-api"
import { logInfo, logError } from "@/lib/debug-utils"
import SiteHeader from "@/components/site-header"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderFormData, setOrderFormData] = useState<OrderFormData>({
    address: {
      name: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      address: "",
    },
    paymentMethod: "wechat",
    remark: "",
  })

  // 如果购物车为空，重定向到首页
  useEffect(() => {
    if (items.length === 0) {
      router.push("/")
    }
  }, [items, router])

  const handleAddressSubmit = (address: Address) => {
    setOrderFormData((prev) => ({ ...prev, address }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setOrderFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOrderFormData((prev) => ({ ...prev, remark: e.target.value }))
  }

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // 验证地址信息
      const { address } = orderFormData
      if (
        !address.name ||
        !address.phone ||
        !address.province ||
        !address.city ||
        !address.district ||
        !address.address
      ) {
        setError("请完善收货地址信息")
        return
      }

      // 准备订单数据
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
      }))

      const orderData = {
        items: orderItems,
        totalAmount: totalPrice,
        address: orderFormData.address,
        paymentMethod: orderFormData.paymentMethod,
        remark: orderFormData.remark,
      }

      logInfo("准备提交订单", { orderData })

      // 提交订单
      const order = await submitOrder(orderData)

      // 清空购物车
      clearCart()

      // 跳转到订单成功页面
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "订单提交失败，请稍后重试"
      setError(errorMessage)
      logError("提交订单失败", { error: err })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null // 等待重定向
  }

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 flex items-center" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回购物车
        </Button>

        <h1 className="text-2xl font-bold mb-6">订单结算</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 收货地址 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  收货地址
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddressForm
                  initialAddress={orderFormData.address}
                  onSubmit={handleAddressSubmit}
                  submitButtonText="保存收货地址"
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>

            {/* 支付方式 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  支付方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={orderFormData.paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wechat" id="wechat" />
                    <Label htmlFor="wechat" className="flex items-center">
                      <Image
                        src="/placeholder.svg?height=24&width=24&text=微信"
                        alt="微信支付"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      微信支付
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alipay" id="alipay" />
                    <Label htmlFor="alipay" className="flex items-center">
                      <Image
                        src="/placeholder.svg?height=24&width=24&text=支付宝"
                        alt="支付宝"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      支付宝
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">货到付款</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 订单备注 */}
            <Card>
              <CardHeader>
                <CardTitle>订单备注</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="请输入订单备注（选填）"
                  value={orderFormData.remark || ""}
                  onChange={handleRemarkChange}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* 订单摘要 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 商品列表 */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3 pb-3 border-b">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          ¥{item.product.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">¥{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 价格摘要 */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">商品总价</span>
                    <span>¥{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">运费</span>
                    <span>¥0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>订单总计</span>
                    <span className="text-rose-600">¥{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg" onClick={handleSubmitOrder} disabled={isSubmitting}>
                  {isSubmitting ? "提交中..." : "提交订单"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
