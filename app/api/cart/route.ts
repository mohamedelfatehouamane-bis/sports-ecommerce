import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create cart for user
    const { data: cart } = await supabase
      .from('carts')
      .select(
        `
        id,
        created_at,
        cart_items (
          id,
          quantity,
          variant_id,
          product_variants (
            id,
            sku,
            price,
            quantity_in_stock,
            product_id,
            products (
              id,
              name,
              slug,
              image_url
            )
          )
        )
      `
      )
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!cart) {
      return NextResponse.json({ items: [], total: 0, count: 0 })
    }

    // Calculate totals
    const items = cart.cart_items || []
    const total = items.reduce((sum, item) => {
      return sum + (item.product_variants?.price || 0) * item.quantity
    }, 0)

    return NextResponse.json({
      cartId: cart.id,
      items: items.map((item) => ({
        id: item.id,
        variantId: item.variant_id,
        quantity: item.quantity,
        sku: item.product_variants?.sku,
        price: item.product_variants?.price,
        productName: item.product_variants?.products?.name,
        productSlug: item.product_variants?.products?.slug,
        productImage: item.product_variants?.products?.image_url,
        inStock: (item.product_variants?.quantity_in_stock || 0) > 0,
      })),
      total,
      count: items.length,
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { variantId, quantity } = await request.json()

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({
          customer_id: user.id,
        })
        .select()
        .single()

      if (cartError) throw cartError
      cart = newCart
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)
      .single()

    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
    } else {
      // Add new item
      await supabase.from('cart_items').insert({
        cart_id: cart.id,
        variant_id: variantId,
        quantity,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
