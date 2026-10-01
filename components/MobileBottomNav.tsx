'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, Truck, ShoppingCart } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from '@/components/language-context'

export function MobileBottomNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)
  const [isBumping, setIsBumping] = useState(false)
  const prevCountRef = useRef(cartCount)

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setIsBumping(true)
      const timer = setTimeout(() => setIsBumping(false), 250)
      prevCountRef.current = cartCount
      return () => clearTimeout(timer)
    }
    prevCountRef.current = cartCount
  }, [cartCount])

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await fetch('/api/cart')
        if (res.ok) {
          const data = await res.json()
          if (data && data.items) {
            const count = data.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
            setCartCount(count)
          }
        }
      } catch (err) {
        console.error('Failed to fetch cart count', err)
      }
    }
    fetchCartCount()

    // Listen to custom cart updates
    const handleCartUpdate = () => fetchCartCount()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-[#020817]/98 border-t border-white/5 flex items-center justify-around px-2 z-50 md:hidden pb-safe">
      <Link href="/" className={`flex flex-col items-center gap-1 min-w-[64px] transition-all active:scale-90 ${isActive('/') ? 'text-[#1687FF] drop-shadow-[0_0_8px_rgba(22,135,255,0.5)]' : 'text-slate-500 hover:text-white'}`}>
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-bold">{t('nav.home')}</span>
      </Link>
      <Link href="/products" className={`flex flex-col items-center gap-1 min-w-[64px] transition-all active:scale-90 ${isActive('/products') ? 'text-[#1687FF] drop-shadow-[0_0_8px_rgba(22,135,255,0.5)]' : 'text-slate-500 hover:text-white'}`}>
        <Grid className="h-5 w-5" />
        <span className="text-[10px] font-bold">{t('nav.catalog')}</span>
      </Link>
      <Link href="/track" className={`flex flex-col items-center gap-1 min-w-[64px] transition-all active:scale-90 ${isActive('/track') ? 'text-[#1687FF] drop-shadow-[0_0_8px_rgba(22,135,255,0.5)]' : 'text-slate-500 hover:text-white'}`}>
        <Truck className="h-5 w-5" />
        <span className="text-[10px] font-bold">{t('nav.track')}</span>
      </Link>
      <Link href="/cart" className={`flex flex-col items-center gap-1 min-w-[64px] transition-all active:scale-90 relative ${isActive('/cart') ? 'text-[#1687FF] drop-shadow-[0_0_8px_rgba(22,135,255,0.5)]' : 'text-slate-500 hover:text-white'}`}>
        <ShoppingCart className="h-5 w-5" />
        <span className="text-[10px] font-bold">{t('nav.cart')}</span>
        {cartCount > 0 && (
          <span className={`absolute top-0 end-4 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1687FF] text-[8px] font-bold text-white shadow-[0_0_8px_rgba(22,135,255,0.8)] transition-transform duration-200 ${isBumping ? 'scale-[1.2]' : 'scale-100'}`}>
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </Link>
    </nav>
  )
}
