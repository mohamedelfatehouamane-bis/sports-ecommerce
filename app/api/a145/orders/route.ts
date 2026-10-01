
import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 15

    let where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (search) where.orderCode = search

    const { orders, count } = await db.getOrders({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })

    return NextResponse.json({
      orders,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
