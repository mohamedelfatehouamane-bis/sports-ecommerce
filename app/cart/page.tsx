'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  variant_id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
  }
  variant: {
    sku: string
    price: number
    quantity_in_stock: number
  }
}

interface CartData {
  id: string
  items: CartItem[]
  total: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart')
        if (!res.ok) throw new Error('Failed to fetch cart')
        const data = await res.json()
        setCart(data)
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId)
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      if (!res.ok) throw new Error('Failed to update cart')
      const updatedCart = await res.json()
      setCart(updatedCart)
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove item')
      const updatedCart = await res.json()
      setCart(updatedCart)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.id }),
      })
      if (!res.ok) throw new Error('Failed to create order')
      const { orderId } = await res.json()
      router.push(`/orders/${orderId}`)
    } catch (error) {
      console.error('Error during checkout:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-6 text-lg text-muted-foreground">Your cart is empty</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                  <div className="flex-1">
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="font-semibold hover:text-primary">{item.product.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">SKU: {item.variant.sku}</p>
                    <p className="mt-2 font-semibold">${item.variant.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="rounded px-2 py-1 hover:bg-muted disabled:opacity-50"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        disabled={updating}
                        className="w-12 border border-border rounded px-2 py-1 text-center"
                        min="1"
                        max={item.variant.quantity_in_stock}
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={
                          updating || item.quantity >= item.variant.quantity_in_stock
                        }
                        className="rounded px-2 py-1 hover:bg-muted disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating}
                      className="text-sm text-destructive hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-lg border border-border bg-card p-6 sticky top-6">
            <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${(cart.total * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${(cart.total * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={updating || cart.items.length === 0}
              className="mt-6 w-full"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
