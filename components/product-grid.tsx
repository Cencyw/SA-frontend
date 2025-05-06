"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import ProductDetails from "./product-details"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"

interface ProductGridProps {
  products: Product[]
  allProducts: Product[] // 所有产品，用于详情页查找
}

export default function ProductGrid({ products, allProducts }: ProductGridProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const { addToCart } = useCart()

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation() // 防止触发卡片点击事件
    addToCart(product, 1)
  }

  return (
    <>
      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">暂无产品</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 group"
              onClick={() => setSelectedProductId(product.id)}
            >
              <div className="relative h-64 w-full">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />

                {/* 快速添加按钮 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="gap-1" onClick={(e) => handleQuickAdd(e, product)}>
                    <ShoppingCart className="h-4 w-4" />
                    快速添加
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                <p className="text-rose-600 font-bold">¥{product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProductId && (
        <ProductDetails
          productId={selectedProductId}
          isOpen={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
          allProducts={allProducts}
        />
      )}
    </>
  )
}
