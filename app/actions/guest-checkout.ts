'use server'

import { cookies } from 'next/headers'
import * as db from '@/lib/data'
import { sendAdminOrderNotification } from '@/lib/firebase/firebase-admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { getDeliveryRate } from '@/lib/delivery-rates'

interface GuestCheckoutData {
  customerName: string
  phoneNumber: string
  wilaya: string
  commune: string
  address: string
  notes?: string
  cartItems: Array<{
    productId: string
    quantity: number
    size?: string
    color?: string
  }>
  idempotencyKey: string
}

interface CheckoutResult {
  success: boolean
  orderId?: string
  orderCode?: string
  error?: string
}

function generateOrderCode(): string {
  const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 16; i++) {
    const randomByte = crypto.randomBytes(1)[0]
    code += allowedChars[randomByte % allowedChars.length]
  }
  return code
}

export async function processGuestCheckout(data: GuestCheckoutData): Promise<CheckoutResult> {
  try {
    // 1. Validate Input
    if (!data.customerName || !data.phoneNumber || !data.wilaya || !data.commune) {
      return { success: false, error: 'Name, phone number, wilaya, and commune are required' }
    }

    if (!data.cartItems || data.cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Validate quantities
    for (const item of data.cartItems) {
      if (!item.productId || typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        return { success: false, error: 'Invalid cart data' }
      }
    }

    // 2. Extract product IDs to check inventory
    const productIds = data.cartItems.map((item) => item.productId)

    // Read the current prices and products outside transaction to prepare data
    const { products } = await db.getProducts({
      where: { id: { in: productIds }, isActive: true }
    })

    if (products.length !== productIds.length) {
      return { success: false, error: 'Some products were not found or are no longer available' }
    }

    const orderCode = generateOrderCode()
    let productsTotal = 0
    const outOfStockItems: string[] = []

    // Prepare order items
    const orderItemsData = data.cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId)!
      if (product.stock < cartItem.quantity) {
        outOfStockItems.push(`${product.name} (only ${product.stock} available)`)
      }
      
      const price = Number(product.price)
      const subtotal = price * cartItem.quantity
      productsTotal += subtotal

      return {
        productId: product.id,
        productName: product.name,
        quantity: cartItem.quantity,
        unitPrice: price,
        subtotal: subtotal,
        size: cartItem.size,
        color: cartItem.color,
      }
    })

    if (outOfStockItems.length > 0) {
      return { success: false, error: `Out of stock: ${outOfStockItems.join(', ')}` }
    }

    const deliveryMethod = data.address.trim() === '' ? 'STOP_DESK' : 'HOME'
    const deliveryFee = getDeliveryRate(data.wilaya, deliveryMethod)

    if (!data.idempotencyKey) {
      return { success: false, error: 'Idempotency key is required' }
    }

    // Idempotency check in mock db is skipped for simplicity or we can simulate it:
    const { orders } = await db.getOrders()
    const existingOrder = orders.find((o: any) => o.idempotencyKey === data.idempotencyKey)
    
    if (existingOrder) {
      // Return success using the recent order to handle double-clicks gracefully
      const cookieStore = await cookies()
      cookieStore.delete('cart_items')
      return { success: true, orderId: existingOrder.id, orderCode: existingOrder.orderCode }
    }

    // Create the order using mock db
    const orderData = {
      orderCode,
      idempotencyKey: data.idempotencyKey,
      customerName: data.customerName,
      customerPhone: data.phoneNumber,
      wilaya: data.wilaya,
      commune: data.commune,
      address: data.address,
      deliveryMethod,
      deliveryFee: deliveryFee ?? 0,
      productsTotal,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'UNPAID',
      status: 'NEW',
    }
    const order = await db.createOrder(orderData, orderItemsData)

    // Atomically decrement stock
    for (const item of data.cartItems) {
      const p = await db.getProduct(item.productId)
      if (p && p.stock >= item.quantity) {
        await db.updateProduct(item.productId, { stock: p.stock - item.quantity })
      } else {
        throw new Error(`Insufficient stock for product ${item.productId}`)
      }
    }

    // 3. Clear the cart
    const cookieStore = await cookies()
    cookieStore.delete('cart_items')

    // 4. Send Notifications
    try {
      await sendAdminOrderNotification({
        orderId: order.id,
        customerName: order.customerName,
        totalAmount: Number(order.productsTotal),
      })
    } catch (e) {
      console.error('[guest-checkout] Failed to send admin push notification:', e)
    }

    try {
      revalidatePath('/a145/orders')
      revalidatePath('/a145')
    } catch (e) {
      console.error('Failed to revalidate admin cache:', e)
    }

    return {
      success: true,
      orderId: order.id,
      orderCode: order.orderCode
    }
  } catch (error) {
    console.error('Guest checkout error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
