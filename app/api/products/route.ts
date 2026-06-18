import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort') || 'created_at'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 12

    let query = supabase
      .from('products')
      .select(
        `
        id,
        name,
        slug,
        description,
        base_price,
        sale_price,
        image_url,
        featured,
        category_id,
        categories(name, slug),
        product_variants(
          id,
          sku,
          price,
          quantity_in_stock,
          size_id,
          color_id,
          material_id,
          sizes(name),
          colors(name, hex_code),
          materials(name)
        )
      `,
        { count: 'exact' }
      )
      .eq('active', true)

    if (category) {
      query = query.eq('categories.slug', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (sortBy === 'price-low') {
      query = query.order('base_price', { ascending: true })
    } else if (sortBy === 'price-high') {
      query = query.order('base_price', { ascending: false })
    } else if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'featured') {
      query = query.eq('featured', true).order('created_at', { ascending: false })
    }

    const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products: data || [],
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
