'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface OrderItem {
  id: string
  variant_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product: {
    name: string
    slug: string
  }
  variant: {
    sku: string
  }
}

interface Order {
  id: string
  order_number: string
  status: string
  subtotal: number
  tax: number
  shipping_cost: number
  total: number
  payment_status: string
  payment_method: string
  tracking_number: string | null
  created_at: string
  items: OrderItem[]
  shipping_address: {
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
            <p className="mb-6 text-muted-foreground">We couldn&apos;t find this order.</p>
            <Link href="/dashboard">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="mb-4 inline-block text-sm text-primary hover:underline">
            ← Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Order {order.order_number}</h1>
              <p className="text-muted-foreground">Placed on {orderDate}</p>
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2">
            {/* Items */}
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold">Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                    <div>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-semibold hover:text-primary">{item.product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">SKU: {item.variant.sku}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.unit_price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Subtotal: ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
              <div className="text-sm text-muted-foreground">
                <p>{order.shipping_address.street_address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.country}</p>
              </div>
              {order.tracking_number && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold">Tracking Number: {order.tracking_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 pt-6 border-t border-border">
                <p className="text-sm">
                  <span className="font-semibold">Payment Status:</span>{' '}
                  <span className="text-muted-foreground capitalize">{order.payment_status}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Payment Method:</span>{' '}
                  <span className="text-muted-foreground capitalize">{order.payment_method}</span>
                </p>
              </div>

              <Link href="/products" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
