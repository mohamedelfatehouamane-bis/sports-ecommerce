'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { formatDZD } from '@/lib/utils/currency'
import { ProductImage } from '@/components/ProductImage'
import { Heart, ShoppingCart, Shirt, Dumbbell, Backpack, SportShoe, Grid } from 'lucide-react'
import { useTranslation } from '@/components/language-context'

const SoccerBallIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="m10.6 9.6-3.8-3.3" />
    <path d="m13.4 9.6 3.8-3.3" />
    <path d="m9 15-4.5 1" />
    <path d="m15 15 4.5 1" />
    <path d="M12 15v4.5" />
  </svg>
)

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  slug: string
  price: string | number
  imageUrl: string | null
  stock: number
  category?: { name: string }
  originalPrice?: string | number | null
}

export default function HomePage() {
  const { t } = useTranslation()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [discountProducts, setDiscountProducts] = useState<Product[]>([])

  useEffect(() => {
    // Fetch products
    fetch('/api/products?sort=newest&page=1')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products.slice(0, 4))
        }
      })
      .catch(err => console.error(err))

    fetch('/api/products?discount=true&page=1')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setDiscountProducts(data.products)
        }
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans pb-24">
      <Header />

      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section 
          className="relative px-6 py-10 md:py-24 overflow-hidden bg-cover bg-center bg-no-repeat rounded-b-[1.5rem] border-b border-white/5"
          style={{ backgroundImage: `url('/images/hero-bg.png')` }}
        >
          {/* Dark translucent overlay for readability over the background image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/90 to-transparent pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020817]/20 to-[#020817] pointer-events-none z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center max-w-7xl mx-auto h-full min-h-[400px] md:min-h-[500px]">
            {/* Text Content (Left side on desktop ~45%) */}
            <div className="w-full md:w-[45%] relative z-20 space-y-4 pt-4 md:pt-0">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
                {t('home.newCollection')}
              </span>
              <h1 className="text-[2.8rem] sm:text-6xl font-extrabold tracking-tight text-white leading-none">
                {t('home.fuelPassion').split(' ')[0]} {t('home.fuelPassion').split(' ').slice(1, -1).join(' ')}<br />
                <span className="text-[#1687FF]">{t('home.fuelPassion').split(' ').pop()}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-[300px]">
                {t('home.premiumGear')}
              </p>
              
              <div className="pt-4">
                <Link href="/products" className="inline-flex items-center justify-center h-10 md:h-12 px-6 rounded-full bg-[#1687FF] text-white font-bold text-xs md:text-sm shadow-[0_0_20px_rgba(22,135,255,0.3)] hover:bg-[#2563EB] transition-all">
                  {t('home.shopNow')} &larr;
                </Link>
              </div>
            </div>

            {/* Right visual placeholder - actual image is absolutely positioned below to break out of container */}
            <div className="hidden md:block md:w-[55%]"></div>
          </div>

          {/* Absolute positioned Hero Image */}
          <div className="absolute z-10 pointer-events-none mix-blend-screen w-[85%] end-[-15%] bottom-0 md:w-[55%] md:end-[0%] md:bottom-[-2%] h-full flex items-end">
            <ProductImage 
              src="/images/hero-shoe-new.jpg" 
              alt="New Collection Shoe and Football" 
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </section>

        <div className="relative z-10 bg-gradient-to-b from-[#020817]/90 via-[#020817]/95 to-[#020817] pt-4 shadow-[0_-15px_40px_rgba(2,8,23,0.6)] rounded-t-3xl -mt-6">
          {/* CATEGORIES */}
        <section className="px-4 py-4 md:py-6 max-w-7xl mx-auto">
          <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-2 touch-pan-x overscroll-x-contain">
            {[
              { name: t('categories.shoes'), key: 'shoes', Icon: SportShoe, active: true },
              { name: t('categories.apparel'), key: 'apparel', Icon: Shirt, active: false },
              { name: t('categories.accessories'), key: 'accessories', Icon: Backpack, active: false },
              { name: t('categories.fitness'), key: 'fitness', Icon: Dumbbell, active: false },
              { name: t('categories.balls'), key: 'balls', Icon: SoccerBallIcon, active: false },
              { name: t('products.allCategories'), key: 'all', Icon: Grid, active: false }
            ].map((cat) => (
              <Link key={cat.key} href={cat.key === 'all' ? '/products' : `/products?category=${cat.key}`} className="shrink-0 select-none">
                <div className={`group flex flex-col items-center justify-center w-[72px] h-[80px] rounded-2xl transition-colors ${
                  cat.active 
                    ? 'bg-[#1a2b4c] border border-[#1687FF]/50 shadow-[0_0_15px_rgba(22,135,255,0.15)]' 
                    : 'bg-[#0a1120] border border-white/5 hover:bg-white/10'
                }`}>
                  <div className={`mb-1.5 transition-colors drop-shadow-md ${cat.active ? 'text-[#1687FF] drop-shadow-[0_0_8px_rgba(22,135,255,0.8)]' : 'text-white/60 group-hover:text-white/90'}`}>
                    <cat.Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <span className={`text-[10px] font-bold ${cat.active ? 'text-white drop-shadow-sm' : 'text-slate-400'}`}>
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SPECIAL DEALS BANNER */}
        {discountProducts.length > 0 && (
        <section className="px-4 py-2 max-w-7xl mx-auto">
          <Link href="/offers" className="block relative overflow-hidden rounded-[1.25rem] bg-[#050B14] border border-[#1687FF]/20 p-5 shadow-lg flex items-center min-h-[110px] cursor-pointer group hover:border-[#1687FF]/40 transition-colors duration-300 hover:shadow-[#1687FF]/10 select-none">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1687FF]/5 rounded-full pointer-events-none transition-all duration-300" />
            <div className="relative z-10 w-[60%] space-y-1">
              <span className="text-[11px] font-black text-[#1687FF] tracking-widest uppercase block mb-1 drop-shadow-md">{t('home.specialDeals')}</span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-1">
                {t('home.upTo50')}
              </h3>
              <p className="text-[11px] font-medium text-slate-300 pb-3">{t('home.onSelectedItems')}</p>
              
              <div className="inline-flex items-center justify-center h-8 px-5 rounded-full bg-white/10 group-hover:bg-[#1687FF] group-hover:border-[#1687FF] border border-white/20 text-white font-bold text-[11px] shadow-sm transition-all">
                عرض جميع العروض &larr;
              </div>
            </div>
            
            {/* Promo Image (Dynamic) */}
            <div className="absolute end-[-10px] top-1/2 -translate-y-1/2 h-[120%] w-32 md:w-48 md:group-hover:scale-105 transition-transform duration-300">
              <ProductImage 
                src={discountProducts[0].imageUrl || "https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&q=80&w=400&h=400"} 
                alt="Special Deal"
                className="object-contain drop-shadow-xl"
              />
            </div>
          </Link>
        </section>
        )}

        {/* FEATURED PRODUCTS */}
        <section className="px-4 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-white tracking-wide uppercase drop-shadow-md">{t('home.featuredProducts')}</h2>
            <Link href="/products" className="text-[12px] font-bold text-[#1687FF] hover:text-[#2563EB] transition-colors flex items-center bg-[#1687FF]/10 px-3 py-1 rounded-full">
              عرض الكل &larr;
            </Link>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 hide-scrollbar pb-4 touch-pan-x overscroll-x-contain">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <div key={product.id} className="shrink-0 select-none w-[160px] md:w-[180px] relative flex flex-col rounded-[1.25rem] bg-[#0a1120] border border-white/10 shadow-lg overflow-hidden group hover:border-[#1687FF]/50 transition-colors">
                <Link href={`/products/${product.slug}`} className="relative aspect-square w-full flex items-center justify-center bg-transparent p-4">
                  {/* Badge */}
                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                    <div className="absolute top-2 right-2 z-10 bg-[#1687FF] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(22,135,255,0.5)]">
                      -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                    </div>
                  )}

                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-contain md:group-hover:scale-110 transition-transform duration-300 drop-shadow-xl p-2"
                  />
                </Link>
                <div className="p-3 flex flex-col flex-1 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
                  <h3 className="text-[13px] font-bold text-white line-clamp-1 leading-tight">{product.name}</h3>
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5 mb-2 line-clamp-1">{product.category?.name || 'Running Shoes'}</span>
                  
                  <div className="mt-auto flex flex-col gap-1">
                    {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                      <span className="text-[10px] font-medium text-slate-500 relative inline-block w-fit after:absolute after:left-0 after:top-1/2 after:h-[1.5px] after:w-full after:-translate-y-1/2 after:bg-[#1687FF] after:rounded-full">
                        {formatDZD(Number(product.originalPrice))}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-black text-[#1687FF] drop-shadow-[0_0_8px_rgba(22,135,255,0.4)]">
                        {formatDZD(Number(product.price))}
                      </span>
                      <button className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-[#1687FF] text-white shadow-[0_0_12px_rgba(22,135,255,0.4)] hover:bg-[#2563EB] hover:shadow-[0_0_16px_rgba(22,135,255,0.6)] active:scale-95 transition-transform shrink-0">
                        <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              // Fallback loaders or empty state if API is slow
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="shrink-0 w-[140px] md:w-auto relative flex flex-col rounded-2xl bg-[#0a1120] border border-white/5 overflow-hidden h-[200px] animate-pulse">
                </div>
              ))
            )}
          </div>
        </section>
        {/* End of content wrapper */}
        </div>
      </main>

      <MobileBottomNav />

      {/* DESKTOP FOOTER */}
      <div className="hidden md:block mt-auto border-t border-white/5">
        <Footer />
      </div>
    </div>
  )
}
