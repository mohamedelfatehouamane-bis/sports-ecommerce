import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Customer profiles are deactivated' }, { status: 404 })
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: 'Customer profiles are deactivated' }, { status: 404 })
}
