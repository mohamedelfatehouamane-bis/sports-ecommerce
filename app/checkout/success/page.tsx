'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDZD } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  tax: number
  shippingCost: number
  total: number
  guestFirstName: string
  guestLastName: string
  guestWilaya: string
  guestPhone: string
  items: Array<{
    productName: string
    sku: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  createdAt: string
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error('[v0] Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h1 className="mb-2 text-2xl font-bold">Order Not Found</h1>
            <p className="mb-6 text-muted-foreground">
              We couldn&apos;t find your order. Please check the link and try again.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold">Sports Shop</h1>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Success Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-4 text-6xl">✓</div>
          <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. Your order number is:{' '}
            <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span>
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold">Customer Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {order.guestFirstName} {order.guestLastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.guestPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Wilaya</p>
                  <p className="font-medium">{order.guestWilaya}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDZD(item.subtotal)}</p>
                      <p className="text-xs text-muted-foreground">{formatDZD(item.unitPrice)}/unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Disclaimer */}
            <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-4">
              <h3 className="mb-2 font-semibold text-amber-900">Shipping Information</h3>
              <ul className="space-y-1 text-sm text-amber-800">
                <li>• Your order will be processed within 24-48 business hours</li>
                <li>• A tracking number will be sent to your phone number</li>
                <li>• Shipping is available only within Algeria</li>
                <li>• Standard delivery time: 3-5 business days</li>
                <li>• Please ensure someone is available to receive the package</li>
              </ul>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="h-fit rounded-lg border border-border bg-card p-6 sticky top-6">
            <h2 className="mb-6 font-semibold">Order Summary</h2>

            <div className="space-y-3 border-b border-border pb-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatDZD(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (19%)</span>
                <span>{formatDZD(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatDZD(order.shippingCost)}</span>
              </div>
            </div>

            <div className="mb-6 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatDZD(order.total)}</span>
            </div>

            <div className="rounded-lg bg-muted p-3 mb-6">
              <p className="text-xs font-medium text-muted-foreground">Payment Status</p>
              <p className="text-sm font-semibold capitalize">{order.status}</p>
            </div>

            <div className="space-y-2">
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button className="w-full">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function OrderSuccessFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-4xl animate-pulse">✓</div>
          <h1 className="mb-2 text-2xl font-bold">Loading order details...</h1>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessContent />
    </Suspense>
  )
}
