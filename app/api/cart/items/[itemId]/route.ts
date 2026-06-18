import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quantity } = await request.json()

    // Verify item belongs to user's cart
    const { data: item } = await supabase
      .from('cart_items')
      .select('id, cart_id, carts(customer_id)')
      .eq('id', params.itemId)
      .single()

    if (!item || item.carts.customer_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (quantity <= 0) {
      // Delete item
      await supabase.from('cart_items').delete().eq('id', params.itemId)
    } else {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', params.itemId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart item update error:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify item belongs to user's cart
    const { data: item } = await supabase
      .from('cart_items')
      .select('id, cart_id, carts(customer_id)')
      .eq('id', params.itemId)
      .single()

    if (!item || item.carts.customer_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await supabase.from('cart_items').delete().eq('id', params.itemId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart item delete error:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
