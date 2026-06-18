import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shippingAddressId, cartId } = await request.json()

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        quantity,
        variant_id,
        product_variants (
          id,
          price,
          quantity_in_stock,
          product_id,
          products (id, name)
        )
      `
      )
      .eq('cart_id', cartId)

    if (cartError) throw cartError

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate totals
    let subtotal = 0
    for (const item of cartItems) {
      const price = item.product_variants?.price || 0
      subtotal += price * item.quantity

      // Check inventory
      if ((item.product_variants?.quantity_in_stock || 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product_variants?.products?.name}` },
          { status: 400 }
        )
      }
    }

    const tax = subtotal * 0.08
    const shippingCost = subtotal > 100 ? 0 : 10
    const total = subtotal + tax + shippingCost

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        tax,
        shipping_cost: shippingCost,
        total,
        payment_status: 'pending',
        shipping_address_id: shippingAddressId,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items and update inventory
    for (const item of cartItems) {
      // Add order item
      await supabase.from('order_items').insert({
        order_id: order.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.product_variants?.price || 0,
        subtotal: (item.product_variants?.price || 0) * item.quantity,
      })

      // Record inventory transaction
      await supabase.from('inventory_transactions').insert({
        variant_id: item.variant_id,
        transaction_type: 'sale',
        quantity: -item.quantity,
        reference_id: order.id,
        notes: `Sale from order ${orderNumber}`,
      })

      // Update stock
      await supabase.rpc('update_variant_stock', {
        variant_id: item.variant_id,
        quantity_change: -item.quantity,
      })
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cartId)

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
      status: 'pending',
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
