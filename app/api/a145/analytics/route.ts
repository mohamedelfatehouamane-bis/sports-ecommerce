
import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { orders } = await db.getOrders();
    const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED');
    
    return NextResponse.json({
      revenue: completedOrders.reduce((acc: number, o: any) => acc + Number(o.productsTotal), 0),
      ordersCount: orders.length,
      customersCount: new Set(orders.map((o: any) => o.customerPhone)).size,
      productsSold: orders.reduce((acc: number, o: any) => acc + o.items.reduce((sum: number, i: any) => sum + i.quantity, 0), 0),
      recentOrders: orders.slice(0, 5),
      popularProducts: [],
      orderStatusDistribution: [],
      revenueByDay: []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
