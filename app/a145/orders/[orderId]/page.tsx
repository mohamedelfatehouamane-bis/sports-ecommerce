'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useParams } from 'next/navigation'
import { formatDZD } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

interface AdminOrderDetail {
  id: string
  orderCode: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  productsTotal: number
  createdAt: string
  customerName: string
  phone: string
  wilaya: string
  city: string
  address: string
  notes: string | null
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    subtotal: number
    productName: string
    size?: string
  }>
  statusHistory: Array<{
    status: string
    createdAt: string
  }>
}

const statusOptions = [
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
  'DELIVERY_FAILED'
]
const paymentStatusOptions = ['UNPAID', 'COLLECTED']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/a145/orders/${orderId}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const data = await res.json()
        setOrder(data)
        setOrderStatus(data.orderStatus)
        setPaymentStatus(data.paymentStatus)
        setNotes(data.notes || '')
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
      const res = await fetch(`/api/a145/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          notes: notes || null,
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
      <div className="min-h-screen bg-transparent">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
            <Link href="/a145/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/a145/orders" className="mb-4 inline-block text-sm text-primary hover:underline">
            ← Back to Orders
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Order {order.orderCode}</h1>
          <p className="text-muted-foreground">Placed on {orderDate}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold">Order Items</h2>
              <div className="space-y-4">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                        {item.size && ` | Size: ${item.size}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatDZD(item.unitPrice)} / unit</p>
                      <p className="text-sm font-bold text-orange-500 mt-1">
                        Subtotal: {formatDZD(item.subtotal)}
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
                  <p className="font-semibold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wilaya</p>
                  <p className="font-semibold">{order.wilaya}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-semibold">{order.city}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Delivery Address</h2>
              <div className="text-sm whitespace-pre-line font-bold">
                {order.address}
              </div>
            </div>

            {/* Status History */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Status History</h2>
              <div className="space-y-3">
                {order.statusHistory?.map((h, i) => (
                   <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span className="font-bold">{h.status}</span>
                      <span className="text-muted-foreground">
                         {new Date(h.createdAt).toLocaleString()}
                      </span>
                   </div>
                ))}
              </div>
            </div>

          </div>

          {/* Fulfillment Controls */}
          <div className="sticky top-6 h-fit">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Management</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  disabled={updating}
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background font-bold"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Status ({order.paymentMethod})</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  disabled={updating}
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background font-bold"
                >
                  {paymentStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes..."
                  disabled={updating}
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full"
                size="lg"
              >
                {updating ? 'Updating...' : 'Save Changes'}
              </Button>

              {/* Order Summary */}
              <div className="border-t border-border pt-6 space-y-2">
                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products Total</span>
                  <span className="font-bold">{formatDZD(order.productsTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-blue-500">
                  <span>Delivery Fee</span>
                  <span>NOT INCLUDED</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-black text-lg text-orange-600 mt-2">
                  <span>Total</span>
                  <span>{formatDZD(order.productsTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
