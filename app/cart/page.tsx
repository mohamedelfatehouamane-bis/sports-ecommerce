'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { formatDZD } from '@/lib/utils/currency'
import { useTranslation } from '@/components/language-context'
import { ProductImage } from '@/components/ProductImage'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  productId: string
  quantity: number
  size?: string
  color?: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    stock: number
    imageUrl: string | null
  }
}

interface CartData {
  items: CartItem[]
  total: number
}

export default function CartPage() {
  const { t, language } = useTranslation()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (!res.ok) throw new Error('Failed to fetch cart')
      const data = await res.json()
      setCart(data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId)
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      if (!res.ok) throw new Error('Failed to update cart')
      await fetchCart()
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove item')
      await fetchCart()
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-12">
        <h1 className="mb-8 text-3xl font-extrabold text-white">{t('cart.title')}</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl">
            <Loader2 className="h-10 w-10 text-[#1687FF] animate-spin mb-4" />
            <p className="text-slate-400 text-sm">{t('cart.loadingCart')}</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl text-center px-4">
            <ShoppingBag className="h-12 w-12 text-slate-500 mb-4" />
            <p className="mb-6 text-base text-slate-400">{t('cart.empty')}</p>
            <Link href="/products">
              <Button className="bg-[#1687FF] hover:bg-[#2563EB] text-white font-bold px-8 shadow-[0_0_20px_rgba(22,135,255,0.2)] rounded-full">
                {t('cart.btnBrowse')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 hover:border-white/10 transition-colors">
                    <div className="flex-1 min-w-0 flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-black/20">
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-bold text-white text-base hover:text-[#1687FF] transition-colors truncate">
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-black text-lg text-white font-mono">
                            {formatDZD(Number(item.product.price))}
                          </span>
                          {item.size && (
                            <span className="text-xs font-bold bg-[#1687FF]/20 text-[#1687FF] border border-[#1687FF]/30 px-2 py-1 rounded-md">
                              {t('details.size') || 'المقاس'}: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs font-bold bg-[#1687FF]/20 text-[#1687FF] border border-[#1687FF]/30 px-2 py-1 rounded-md mt-1 sm:mt-0 sm:ms-2">
                              {t('details.color') || 'اللون'}: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
                      <div className="flex items-center gap-1 bg-[#020817]/80 border border-white/10 rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                          }
                          disabled={updating}
                          className="w-10 bg-transparent text-white text-center text-sm font-mono focus:outline-none"
                          min="1"
                          max={item.product.stock}
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            updating || item.quantity >= item.product.stock
                          }
                          className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updating}
                        className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-10 w-10 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/products">
                  <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full px-6">
                    {t('cart.btnContinueShopping')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-white">{t('cart.summary')}</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('cart.subtotal')}</span>
                  <span className="font-mono text-white font-bold">{formatDZD(cart.total)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-400">
                  <span>{t('cart.shipping')}</span>
                  <span>غير مشمول</span>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between text-lg font-black text-white">
                    <span>{t('cart.total')}</span>
                    <span className="font-mono text-white">{formatDZD(cart.total)}</span>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-[#1687FF] bg-[#1687FF]/10 p-3 rounded-xl border border-[#1687FF]/20">
                    {language === 'ar' ? 'سعر التوصيل غير شامل في السعر. يتم دفع رسوم التوصيل بشكل منفصل لشركة التوصيل.' : 'Delivery fee is not included in the product price. Delivery fees are paid separately to the delivery company.'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={updating || cart.items.length === 0}
                className="w-full bg-[#1687FF] hover:bg-[#2563EB] text-white font-bold rounded-full shadow-[0_0_20px_rgba(22,135,255,0.2)] h-12 text-base transition-all"
              >
                {t('cart.btnCheckout')}
              </Button>

              <p className="text-center text-[10px] text-slate-500">
                {t('cart.secureNotice')}
              </p>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  )
}
