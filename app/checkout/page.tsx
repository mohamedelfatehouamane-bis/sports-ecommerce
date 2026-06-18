'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { GuestCheckoutForm } from '@/components/checkout/guest-checkout-form'
import { formatDZD } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  variantId: string
  productName: string
  price: number
  quantity: number
  sku: string
}

interface CartData {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart')
        if (!res.ok) throw new Error('Failed to fetch cart')
        const data = await res.json()

        if (!data.items || data.items.length === 0) {
          router.push('/cart')
          return
        }

        // Calculate totals
        const subtotal = data.items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
        const tax = subtotal * 0.19 // 19% VAT for Algeria
        const total = subtotal + tax + 150 // 150 DZD shipping

        setCart({
          items: data.items,
          subtotal,
          tax,
          total,
        })
      } catch (error) {
        console.error('[v0] Error fetching cart:', error)
        router.push('/cart')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold">Sports Shop</h1>
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <GuestCheckoutForm
          cartItems={cart.items}
          subtotal={cart.subtotal}
          tax={cart.tax}
          total={cart.total}
        />
      </main>
    </div>
  )
}
