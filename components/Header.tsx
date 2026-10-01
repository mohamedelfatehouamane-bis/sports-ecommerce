'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Header() {
  const [cartCount, setCartCount] = useState(0)

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

    // Optional: listen to a custom event if cart updates
    const handleCartUpdate = () => fetchCartCount()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-[#020817]/95 border-b border-white/5">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="TG Sports" className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(22,135,255,0.15)]" />
          <span dir="ltr" className="text-[1.2rem] font-bold tracking-wide text-white uppercase flex gap-1 ml-1">
            TG <span className="text-[#1687FF] font-black">SPORT</span>
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1687FF] text-[9px] font-bold text-white shadow-[0_0_10px_rgba(22,135,255,0.4)]">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
