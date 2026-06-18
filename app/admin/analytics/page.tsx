'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface Analytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  topProducts: Array<{
    name: string
    slug: string
    quantity: number
  }>
  orderStatusDistribution: Record<string, number>
  period: number
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/admin/analytics?period=${period}`)
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Unable to load analytics</p>
          </div>
        </div>
      </div>
    )
  }

  const statuses = Object.entries(analytics.orderStatusDistribution).sort(
    ([, a], [, b]) => b - a
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-border rounded px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Link href="/admin/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <p className="mt-2 text-3xl font-bold">{analytics.totalOrders}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">New Customers</p>
            <p className="mt-2 text-3xl font-bold">{analytics.totalCustomers}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
            <p className="mt-2 text-3xl font-bold">${analytics.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top Products */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Top Products</h2>
            {analytics.topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.slug} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <Link href={`/products/${product.slug}`} className="font-semibold hover:text-primary">
                          {product.name}
                        </Link>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{product.quantity} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Status Distribution */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">Order Status Distribution</h2>
            {statuses.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders data available</p>
            ) : (
              <div className="space-y-4">
                {statuses.map(([status, count]) => (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{status}</span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(count / analytics.totalOrders) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Summary</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="font-semibold">Last {analytics.period} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="font-semibold">
                {analytics.totalCustomers > 0
                  ? ((analytics.totalOrders / analytics.totalCustomers) * 100).toFixed(1)
                  : '0'}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
