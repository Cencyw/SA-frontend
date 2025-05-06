import { NextResponse } from "next/server"
import { products } from "@/lib/products"

export async function GET(request: Request) {
  // 获取URL参数
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "8")

  // 计算分页
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedProducts = products.slice(startIndex, endIndex)
  const total = products.length
  const totalPages = Math.ceil(total / limit)

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({
    products: paginatedProducts,
    total,
    totalPages,
    page,
    limit,
  })
}
