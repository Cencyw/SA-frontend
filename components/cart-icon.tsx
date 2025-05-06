"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"

export default function CartIcon() {
  const { openCart, totalItems } = useCart()

  return (
    <Button variant="ghost" size="icon" onClick={openCart} className="relative">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Button>
  )
}
