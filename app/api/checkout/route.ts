import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Checkout API endpoint is deactivated. Use guest checkout action instead.' },
    { status: 404 }
  )
}
