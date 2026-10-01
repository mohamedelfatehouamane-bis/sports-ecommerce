
import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items = body.items || []
    if (!items.length) return NextResponse.json({ items: [], total: 0, count: 0 })
    
    const productIds = items.map((i: any) => i.productId)
    const { products } = await db.getProducts({ where: { id: { in: productIds } } })
    
    const enrichedItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId)
      return { ...item, product }
    })
    
    const total = enrichedItems.reduce((acc: number, item: any) => acc + (item.product?.price || 0) * item.quantity, 0)
    
    return NextResponse.json({ items: enrichedItems, total, count: items.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart data' }, { status: 500 })
  }
}
