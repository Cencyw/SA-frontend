import { NextResponse } from "next/server"
import { OrderStatus } from "@/lib/types"

// 模拟订单数据
const mockOrders = new Map()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 检查是否有缓存的订单
  if (mockOrders.has(id)) {
    return NextResponse.json(mockOrders.get(id))
  }

  // 模拟创建一个新订单
  const order = {
    id,
    userId: "user123",
    items: [
      {
        productId: "1",
        productName: "高级智能手表",
        productImage: "/placeholder.svg?height=400&width=400",
        price: 1299,
        quantity: 1,
      },
    ],
    totalAmount: 1299,
    address: {
      name: "张三",
      phone: "13800138000",
      province: "广东省",
      city: "深圳市",
      district: "南山区",
      address: "科技园路1号",
    },
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentMethod: "wechat",
    remark: "",
  }

  // 缓存订单
  mockOrders.set(id, order)

  return NextResponse.json(order)
}
