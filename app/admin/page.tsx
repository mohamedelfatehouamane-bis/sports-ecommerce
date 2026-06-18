'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  recentOrders: Array<{
    id: string
    order_number: string
    status: string
    total: number
    created_at: string
  }>
  recentProducts: Array<{
    id: string
    name: string
    slug: string
    base_price: number
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent orders
        const ordersRes = await fetch('/api/admin/orders?limit=5')
        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] }

        // Fetch recent products
        const productsRes = await fetch('/api/products?limit=5')
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] }

        setStats({
          recentOrders: ordersData.orders.slice(0, 5),
          recentProducts: productsData.products.slice(0, 5),
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="mb-2 text-3xl font-bold">Welcome to Admin Panel</h2>
          <p className="text-muted-foreground">
            Manage your sports shop products, orders, customers, and view analytics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/products">
              <div className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <h4 className="font-semibold mb-2">Product Management</h4>
                <p className="text-sm text-muted-foreground mb-4">Add, edit, or manage products and inventory</p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Products
                </Button>
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <h4 className="font-semibold mb-2">Order Management</h4>
                <p className="text-sm text-muted-foreground mb-4">Process and fulfill customer orders</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Orders
                </Button>
              </div>
            </Link>

            <Link href="/admin/analytics">
              <div className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <h4 className="font-semibold mb-2">Analytics & Reports</h4>
                <p className="text-sm text-muted-foreground mb-4">View sales trends and business metrics</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Analytics
                </Button>
              </div>
            </Link>

            <Link href="/dashboard">
              <div className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <h4 className="font-semibold mb-2">Customer Portal</h4>
                <p className="text-sm text-muted-foreground mb-4">Switch to customer account view</p>
                <Button variant="outline" size="sm" className="w-full">
                  Customer View
                </Button>
              </div>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Orders */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <div className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50">
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total.toFixed(2)}</p>
                          <span
                            className={`inline-block text-xs font-semibold rounded px-2 py-0.5 capitalize ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No recent orders</p>
              )}
            </div>

            {/* Recent Products */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Products</h3>
                <Link href="/admin/products">
                  <Button variant="outline" size="sm">
                    Add Product
                  </Button>
                </Link>
              </div>

              {stats?.recentProducts && stats.recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentProducts.map((product) => (
                    <Link key={product.id} href={`/admin/products/${product.id}`}>
                      <div className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                        <p className="font-semibold">${product.base_price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No recent products</p>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
          <h3 className="mb-3 font-semibold">Admin Panel Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Product catalog management with variants and inventory tracking</li>
            <li>✓ Complete order fulfillment workflow with status updates</li>
            <li>✓ Customer management and order history</li>
            <li>✓ Sales analytics and reporting with time-period filters</li>
            <li>✓ Real-time inventory updates and SKU tracking</li>
            <li>✓ Comprehensive admin controls and access management</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
