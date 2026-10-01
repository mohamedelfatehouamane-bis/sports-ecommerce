'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { formatDZD } from '@/lib/utils/currency'
import { logoutAdmin } from '@/app/actions/admin-auth'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    productsTotal: string | number
    createdAt: string
  }>
  recentProducts: Array<{
    id: string
    name: string
    price: number
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    const res = await logoutAdmin()
    if (res.success) {
      router.push('/a145/login')
      router.refresh()
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent orders
        const ordersRes = await fetch('/api/a145/orders?limit=5')
        const ordersData = ordersRes.ok ? await ordersRes.json() : []

        // Fetch recent products
        const productsRes = await fetch('/api/products?limit=5')
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] }

        setStats({
          recentOrders: Array.isArray(ordersData) ? ordersData.slice(0, 5) : [],
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

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-lg font-bold text-white tracking-wider uppercase">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/a145/settings">
              <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
                Store Settings
              </Button>
            </Link>
            <Link href="/a145/media">
              <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
                Media Manager
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-600/10">
                Back to Store
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-800 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12 w-full flex-1">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="mb-2 text-3xl font-black text-white">Welcome to Admin Panel</h2>
          <p className="text-slate-400 text-sm">
            Manage your sports shop products, catalog, order fulfillment, media assets, and view store analytics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Link href="/a145/products">
              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-5 hover:border-slate-800 transition-colors cursor-pointer space-y-3 flex flex-col h-full justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Products</h4>
                  <p className="text-xs text-slate-400 mt-1">Add, edit, or manage products, variations, sizes, and stock catalog</p>
                </div>
                <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 mt-4">
                  Manage Catalog
                </Button>
              </div>
            </Link>

            <Link href="/a145/orders">
              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-5 hover:border-slate-800 transition-colors cursor-pointer space-y-3 flex flex-col h-full justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Orders</h4>
                  <p className="text-xs text-slate-400 mt-1">Process customer orders, update tracking numbers, and fulfill packages</p>
                </div>
                <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 mt-4">
                  View Orders
                </Button>
              </div>
            </Link>

            <Link href="/a145/media">
              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-5 hover:border-slate-800 transition-colors cursor-pointer space-y-3 flex flex-col h-full justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Media Manager</h4>
                  <p className="text-xs text-slate-400 mt-1">Browse, upload, and clean up product assets directly</p>
                </div>
                <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 mt-4">
                  Open Assets
                </Button>
              </div>
            </Link>

            <Link href="/a145/settings">
              <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-5 hover:border-slate-800 transition-colors cursor-pointer space-y-3 flex flex-col h-full justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">Store Settings</h4>
                  <p className="text-xs text-slate-400 mt-1">Edit store contact numbers, address coordinates, email, logo, and social links</p>
                </div>
                <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 mt-4">
                  Open Preferences
                </Button>
              </div>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 border border-slate-800 bg-slate-900/10 rounded-2xl">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading dashboard data...</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Orders */}
            <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Recent Orders</h3>
                <Link href="/a145/orders">
                  <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
                    View All
                  </Button>
                </Link>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <Link key={order.id} href={`/a145/orders/${order.id}`}>
                      <div className="flex items-center justify-between rounded-xl border border-slate-850 p-4 hover:bg-slate-900/40 transition-colors">
                        <div>
                          <p className="font-bold text-white font-mono">{order.orderNumber}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white font-mono">{formatDZD(Number(order.productsTotal))}</p>
                          <span
                            className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 mt-1 capitalize border ${
                              order.status === 'DELIVERED' ? 'bg-emerald-950/40 border-emerald-850 text-emerald-400' :
                              order.status === 'CANCELLED' || order.status === 'RETURNED' ? 'bg-rose-950/40 border-rose-850 text-rose-450' :
                              'bg-yellow-950/40 border-yellow-850 text-yellow-400'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-6 text-sm">No recent orders</p>
              )}
            </div>

            {/* Recent Products */}
            <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Recent Products</h3>
                <Link href="/a145/products/new">
                  <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
                    Add Product
                  </Button>
                </Link>
              </div>

              {stats?.recentProducts && stats.recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentProducts.map((product) => (
                    <Link key={product.id} href={`/a145/products/${product.id}/edit`}>
                      <div className="flex items-center justify-between rounded-xl border border-slate-850 p-4 hover:bg-slate-900/40 transition-colors">
                        <div>
                          <p className="font-bold text-white">{product.name}</p>
                        </div>
                        <p className="font-black text-white font-mono">{formatDZD(product.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-6 text-sm">No recent products</p>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 rounded-2xl border border-slate-850 bg-slate-900/5 p-6 space-y-3">
          <h3 className="font-bold text-white text-base">Store Control Center</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>✓ Product catalog management</li>
            <li>✓ Complete guest checkout and order fulfillment workflow</li>
            <li>✓ Store metadata and preferences editable directly from general settings</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
