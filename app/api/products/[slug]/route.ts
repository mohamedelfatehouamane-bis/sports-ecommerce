import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    const { slug } = params

    const { data, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        description,
        long_description,
        base_price,
        sale_price,
        image_url,
        featured,
        category_id,
        active,
        created_at,
        categories(id, name, slug),
        product_variants(
          id,
          sku,
          price,
          cost,
          quantity_in_stock,
          reorder_level,
          active,
          size_id,
          color_id,
          material_id,
          sizes(id, name, display_order),
          colors(id, name, hex_code, display_order),
          materials(id, name, description, display_order)
        ),
        reviews(
          id,
          rating,
          title,
          content,
          verified_purchase,
          created_at,
          customers(first_name, last_name)
        )
      `
      )
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate average rating
    const reviews = data.reviews || []
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

    return NextResponse.json({
      product: data,
      averageRating,
      reviewCount: reviews.length,
      verifiedPurchaseCount: reviews.filter((r) => r.verified_purchase).length,
    })
  } catch (error) {
    console.error('Product detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
