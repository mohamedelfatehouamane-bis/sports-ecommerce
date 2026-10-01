import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort') || 'created_at'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 12

    let where: any = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (searchParams.get('discount') === 'true') {
      where.originalPrice = { not: null }
    }

    let orderBy: any = {}
    if (sortBy === 'price-low') {
      orderBy = { price: 'asc' }
    } else if (sortBy === 'price-high') {
      orderBy = { price: 'desc' }
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else {
      orderBy = { createdAt: 'desc' }
    }

    const { products, count } = await db.getProducts({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true
      }
    })

    // If discount flag is on, filter out any products where originalPrice <= price
    let finalProducts = products
    if (searchParams.get('discount') === 'true') {
      finalProducts = products.filter(p => p.originalPrice && Number(p.originalPrice) > Number(p.price))
    }

    return NextResponse.json({
      products: finalProducts || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
