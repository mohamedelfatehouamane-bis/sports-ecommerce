import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          id,
          variant_id,
          quantity,
          unit_price,
          subtotal,
          product_variants (
            id,
            sku,
            products (
              id,
              name,
              slug
            )
          )
        ),
        addresses (*)
      `
      )
      .eq('id', params.orderId)
      .eq('customer_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Format the response
    const formattedOrder = {
      ...order,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        product: {
          name: item.product_variants.products.name,
          slug: item.product_variants.products.slug,
        },
        variant: {
          sku: item.product_variants.sku,
        },
      })),
      shipping_address: order.addresses,
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
