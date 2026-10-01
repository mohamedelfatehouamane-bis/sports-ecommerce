import * as db from '@/lib/data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Clean trailing hyphens in case they exist
    const cleanSlug = slug.replace(/-+$/g, '')

    const product = await db.getProductBySlug(cleanSlug, { variants: true, category: true })

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product
    })
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 })
  }
}
