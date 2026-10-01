'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GuestCheckoutForm } from '@/components/checkout/guest-checkout-form'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/components/language-context'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  size?: string
}

interface CartData {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart')
        if (!res.ok) throw new Error('Failed to fetch cart')
        const data = await res.json()

        if (!data.items || data.items.length === 0) {
          router.push('/cart')
          return
        }

        // Calculate totals
        const subtotal = data.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)
        const tax = 0
        const total = subtotal

        setCart({
          items: data.items.map((item: any) => ({
            id: item.id,
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            size: item.size,
          })),
          subtotal,
          tax,
          total,
        })
      } catch (error) {
        console.error('Error fetching cart:', error)
        router.push('/cart')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [router])

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl">
            <Loader2 className="h-10 w-10 text-[#1687FF] animate-spin mb-4" />
            <p className="text-slate-400 text-sm">{t('checkout.loadingCheckout')}</p>
          </div>
        ) : !cart ? (
          null
        ) : (
          <GuestCheckoutForm
            cartItems={cart.items}
            subtotal={cart.subtotal}
            tax={cart.tax}
            total={cart.total}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
