"use client"

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart, type CartItem as CartItemType } from "@/context/cart-context"
import { Button } from "@/components/ui/button"

export default function CartSidebar() {
  const router = useRouter()
  const { items, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()

  const handleCheckout = () => {
    closeCart()
    router.push("/checkout")
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={closeCart} />

      {/* 侧边栏 */}
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            购物车
          </h2>
          <button onClick={closeCart} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
            <span className="sr-only">关闭</span>
          </button>
        </div>

        {/* 购物车内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="h-12 w-12 mb-2" />
              <p>购物车是空的</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                  onRemove={() => removeFromCart(item.product.id)}
                  onUpdateQuantity={(quantity) => updateQuantity(item.product.id, quantity)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* 底部结算区 */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>总计</span>
              <span>¥{totalPrice.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={clearCart}>
                清空购物车
              </Button>
              <Button onClick={handleCheckout}>去结算</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 购物车商品组件
function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItemType
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
}) {
  return (
    <li className="flex border rounded-lg overflow-hidden">
      {/* 商品图片 */}
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image src={item.product.image || "/placeholder.svg"} alt={item.product.name} fill className="object-cover" />
      </div>

      {/* 商品信息 */}
      <div className="flex-1 flex flex-col p-2">
        <div className="flex justify-between">
          <h3 className="font-medium line-clamp-1">{item.product.name}</h3>
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-rose-600 font-medium">¥{item.product.price.toFixed(2)}</p>

        {/* 数量控制 */}
        <div className="flex items-center mt-auto">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center border rounded-l-md"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-10 text-center border-t border-b">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center border rounded-r-md"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </li>
  )
}
