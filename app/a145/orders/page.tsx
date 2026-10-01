'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDZD } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

interface AdminOrder {
  id: string
  orderCode: string
  orderStatus: string
  paymentStatus: string
  productsTotal: number
  createdAt: string
  customerName: string
  phone: string
  items: Array<{ id: string }>
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-blue-200 text-blue-900',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  RETURNED: 'bg-red-100 text-red-800',
  DELIVERY_FAILED: 'bg-rose-200 text-rose-900',
}

const allStatuses = [
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams({
          limit: '50',
          offset: '0',
        })

        if (filter) {
          params.append('status', filter)
        }

        const res = await fetch(`/api/a145/orders?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        setOrders(data.orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filter])

  const filteredOrders = orders.filter(
    (order) =>
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <Link href="/a145/products">
            <Button variant="outline">Manage Products</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <Input
            type="text"
            placeholder="Search by order code, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === '' ? 'default' : 'outline'}
              onClick={() => setFilter('')}
              size="sm"
            >
              All Orders
            </Button>
            {allStatuses.map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                size="sm"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Order Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-sm font-bold">{order.orderCode}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 font-semibold">{formatDZD(order.productsTotal)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold ${statusColors[order.orderStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold ${order.paymentStatus === 'COLLECTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/a145/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
