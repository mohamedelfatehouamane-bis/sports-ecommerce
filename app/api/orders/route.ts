import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Disable user-specific order queries since auth/sessions are removed.
  // Return empty list of orders.
  return NextResponse.json({
    orders: [],
    total: 0,
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Order creation via API is deprecated. Use processGuestCheckout action instead.' },
    { status: 400 }
  )
}
