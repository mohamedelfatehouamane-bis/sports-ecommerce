
import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const order = await db.getOrder(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 })
  }
}
