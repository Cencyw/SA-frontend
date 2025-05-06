import { NextResponse } from "next/server"
import { products } from "@/lib/products"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // 查找产品
  const product = products.find((p) => p.id === id)

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(product.comments)
}
