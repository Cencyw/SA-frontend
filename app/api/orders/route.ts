import { NextResponse } from "next/server"
import { OrderStatus } from "@/lib/types"

// 模拟订单ID生成
function generateOrderId() {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证请求数据
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "订单商品不能为空" }, { status: 400 })
    }

    if (!body.address || !body.address.name || !body.address.phone || !body.address.address) {
      return NextResponse.json({ error: "收货地址信息不完整" }, { status: 400 })
    }

    if (!body.paymentMethod) {
      return NextResponse.json({ error: "请选择支付方式" }, { status: 400 })
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 创建订单
    const order = {
      id: generateOrderId(),
      userId: "user123", // 模拟用户ID
      items: body.items,
      totalAmount: body.totalAmount,
      address: body.address,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod: body.paymentMethod,
      remark: body.remark || "",
    }

    // 这里应该将订单保存到数据库
    // 为了演示，我们直接返回创建的订单

    return NextResponse.json(order)
  } catch (error) {
    console.error("创建订单失败:", error)
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
  }
}
