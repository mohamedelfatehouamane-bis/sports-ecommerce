import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type CartCookieItem = {
  productId: string
  quantity: number
}

// Simple UUID v4 validator
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params // itemId is productId
    
    if (!isValidUUID(itemId)) {
       return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { quantity } = await request.json()
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cartCookie = cookieStore.get('cart_items')?.value
    let cartItems: CartCookieItem[] = []
    
    if (cartCookie) {
      try {
        cartItems = JSON.parse(cartCookie)
        if (!Array.isArray(cartItems)) cartItems = []
      } catch {
        cartItems = []
      }
    }

    // Clean cart
    cartItems = cartItems.filter(item => 
      item && 
      typeof item === 'object' && 
      typeof item.productId === 'string' &&
      isValidUUID(item.productId) &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    )

    const existingItemIndex = cartItems.findIndex(item => item.productId === itemId)
    if (existingItemIndex >= 0) {
      if (quantity <= 0) {
        cartItems.splice(existingItemIndex, 1)
      } else {
        cartItems[existingItemIndex].quantity = quantity
      }
    }

    cookieStore.set('cart_items', JSON.stringify(cartItems), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart item update error:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    
    if (!isValidUUID(itemId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cartCookie = cookieStore.get('cart_items')?.value
    let cartItems: CartCookieItem[] = []
    
    if (cartCookie) {
      try {
        cartItems = JSON.parse(cartCookie)
        if (!Array.isArray(cartItems)) cartItems = []
      } catch {
        cartItems = []
      }
    }

    cartItems = cartItems.filter(item => 
      item && 
      typeof item === 'object' && 
      typeof item.productId === 'string' &&
      isValidUUID(item.productId) &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.productId !== itemId
    )

    cookieStore.set('cart_items', JSON.stringify(cartItems), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart item delete error:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
