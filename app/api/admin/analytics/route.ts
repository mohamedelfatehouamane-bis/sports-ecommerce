import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: customer } = await supabase
      .from('customers')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!customer?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Total Revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'completed')
      .gte('created_at', startDate.toISOString())

    const totalRevenue = (revenueData || []).reduce((sum, order) => sum + order.total, 0)

    // Total Orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', startDate.toISOString())

    const totalOrders = ordersData?.length || 0

    // Total Customers
    const { data: customersData } = await supabase
      .from('customers')
      .select('id')
      .gte('created_at', startDate.toISOString())

    const totalCustomers = customersData?.length || 0

    // Product Performance
    const { data: performanceData } = await supabase
      .from('order_items')
      .select(
        `
        quantity,
        product_variants(
          products(id, name, slug)
        )
      `
      )
      .gte('created_at', startDate.toISOString())

    const productSales: Record<string, { name: string; quantity: number; slug: string }> = {}
    ;(performanceData || []).forEach((item: any) => {
      const productId = item.product_variants.products.id
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product_variants.products.name,
          slug: item.product_variants.products.slug,
          quantity: 0,
        }
      }
      productSales[productId].quantity += item.quantity
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Order Status Distribution
    const { data: orderStatusData } = await supabase
      .from('orders')
      .select('status')
      .gte('created_at', startDate.toISOString())

    const orderStatusDistribution: Record<string, number> = {}
    ;(orderStatusData || []).forEach((order: any) => {
      orderStatusDistribution[order.status] = (orderStatusDistribution[order.status] || 0) + 1
    })

    // Average Order Value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      topProducts,
      orderStatusDistribution,
      period: parseInt(period),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
