"use client"

import Link from "next/link"
import CartIcon from "@/components/cart-icon"

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          商品商城
        </Link>
        <CartIcon />
      </div>
    </header>
  )
}
