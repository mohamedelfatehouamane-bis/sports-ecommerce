
import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderCode, phoneNumber } = await request.json()
    const order = await db.getOrderByCode(orderCode)
    if (!order || order.customerPhone !== phoneNumber) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}
