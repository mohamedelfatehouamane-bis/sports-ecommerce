'use server'

import { createClient } from '@/lib/supabase/server'

interface GuestCheckoutData {
  firstName: string
  lastName: string
  phone: string
  wilaya: string
  cartItems: Array<{
    variantId: string
    quantity: number
  }>
}

interface CheckoutResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  error?: string
}

export async function processGuestCheckout(data: GuestCheckoutData): Promise<CheckoutResult> {
  try {
    const supabase = await createClient()

    // Validate input
    if (!data.firstName || !data.lastName || !data.phone || !data.wilaya) {
      return { success: false, error: 'All fields are required' }
    }

    if (!data.cartItems || data.cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Phone validation (simple DZ format check)
    const phoneRegex = /^(?:\+213|0)?[567]\d{8}$/
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      return { success: false, error: 'Invalid Algerian phone number' }
    }

    // Fetch variants with current prices and stock
    const { data: variants, error: variantError } = await supabase
      .from('product_variants')
      .select('id, sku, price, quantity_in_stock')
      .in(
        'id',
        data.cartItems.map((item) => item.variantId)
      )

    if (variantError) {
      console.error('[v0] Variant fetch error:', variantError)
      return { success: false, error: 'Failed to fetch product information' }
    }

    if (!variants) {
      return { success: false, error: 'Products not found' }
    }

    // Validate stock and calculate totals
    let subtotal = new Decimal(0)
    const outOfStockItems: string[] = []

    for (const cartItem of data.cartItems) {
      const variant = variants.find((v) => v.id === cartItem.variantId)
      if (!variant) {
        return { success: false, error: `Product ${cartItem.variantId} not found` }
      }

      if (variant.quantity_in_stock < cartItem.quantity) {
        outOfStockItems.push(`${variant.sku} (only ${variant.quantity_in_stock} available)`)
      }

      const itemTotal = new Decimal(variant.price).times(new Decimal(cartItem.quantity))
      subtotal = subtotal.plus(itemTotal)
    }

    if (outOfStockItems.length > 0) {
      return {
        success: false,
        error: `Out of stock: ${outOfStockItems.join(', ')}`,
      }
    }

    // Calculate tax (19% VAT for Algeria)
    const tax = subtotal.times(new Decimal('0.19'))

    // Calculate shipping (150 DZD flat rate for now)
    const shippingCost = new Decimal('150')

    // Calculate total
    const total = subtotal.plus(tax).plus(shippingCost)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        status: 'pending',
        subtotal: subtotal.toNumber(),
        tax: tax.toNumber(),
        shipping_cost: shippingCost.toNumber(),
        total: total.toNumber(),
        payment_status: 'pending',
        guest_first_name: data.firstName,
        guest_last_name: data.lastName,
        guest_wilaya: data.wilaya,
        guest_phone: data.phone,
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('[v0] Order creation error:', orderError)
      return { success: false, error: 'Failed to create order' }
    }

    if (!order) {
      return { success: false, error: 'Order creation returned no data' }
    }

    // Insert order items
    const orderItems = data.cartItems.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!
      const unitPrice = new Decimal(variant.price)
      const subtotal = unitPrice.times(new Decimal(item.quantity))

      return {
        order_id: order.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: unitPrice.toNumber(),
        subtotal: subtotal.toNumber(),
      }
    })

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('[v0] Order items error:', itemsError)
      // Don't fail here, order is already created
    }

    // Update inventory for each variant
    for (const cartItem of data.cartItems) {
      const { error: updateError } = await supabase.rpc('update_variant_stock', {
        variant_id: cartItem.variantId,
        quantity_change: -cartItem.quantity,
      })

      if (updateError) {
        console.error('[v0] Stock update error:', updateError)
        // Continue anyway, but log the issue
      }
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
    }
  } catch (error) {
    console.error('[v0] Guest checkout error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
