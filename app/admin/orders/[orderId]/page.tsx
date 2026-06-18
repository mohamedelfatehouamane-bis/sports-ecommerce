'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface AdminOrderDetail {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  subtotal: number
  tax: number
  shipping_cost: number
  tracking_number: string | null
  created_at: string
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    product_variants: {
      sku: string
      products: {
        id: string
        name: string
        slug: string
      }
    }
  }>
  customers: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  addresses: {
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatusOptions = ['pending', 'completed', 'failed', 'refunded']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const data = await res.json()
        setOrder(data)
        setStatus(data.status)
        setPaymentStatus(data.payment_status)
        setTrackingNumber(data.tracking_number || '')
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleUpdate = async () => {
    if (!order) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          tracking_number: trackingNumber || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to update order')
      const updatedOrder = await res.json()
      setOrder(updatedOrder)
      alert('Order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

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
            <Link href="/admin/orders">
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
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/orders" className="mb-4 inline-block text-sm text-primary hover:underline">
            ← Back to Orders
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Order {order.order_number}</h1>
          <p className="text-muted-foreground">Placed on {orderDate}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold">Order Items</h2>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0"
                  >
                    <div>
                      <Link href={`/products/${item.product_variants.products.slug}`}>
                        <h3 className="font-semibold hover:text-primary">
                          {item.product_variants.products.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.product_variants.sku} • Qty: {item.quantity}
                      </p>
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

            {/* Customer Info */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Customer Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">
                    {order.customers.first_name} {order.customers.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{order.customers.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{order.customers.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
              <div className="text-sm text-muted-foreground">
                <p>{order.addresses.street_address}</p>
                <p>
                  {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                </p>
                <p>{order.addresses.country}</p>
              </div>
            </div>
          </div>

          {/* Fulfillment Controls */}
          <div className="sticky top-6 h-fit">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Status</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={updating}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  disabled={updating}
                  className="w-full border border-border rounded px-3 py-2 text-sm"
                >
                  {paymentStatusOptions.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <Input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., 1Z999AA10123456784"
                  disabled={updating}
                />
              </div>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full"
                size="lg"
              >
                {updating ? 'Updating...' : 'Update Order'}
              </Button>

              {/* Order Summary */}
              <div className="border-t border-border pt-6 space-y-2">
                <h3 className="font-semibold">Summary</h3>
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
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
