'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDZD } from '@/lib/utils/currency'
import { ProductImage } from '@/components/ProductImage'
import { Shirt, ShoppingCart } from 'lucide-react'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { useTranslation } from '@/components/language-context'

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number | string
  originalPrice?: number | string | null
  stock: number
  imageUrl: string
  category: { name: string; slug: string }
}

function OffersPageContent() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products?discount=true&page=${page}`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const inStock = (product: Product) => product.stock > 0

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-200 flex flex-col">
      <Header />
      
      {/* Page Header */}
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#020817] via-[#020817]/90 to-[#020817] pt-12 pb-8 border-b border-white/5">
        <div className="absolute inset-0 bg-[#1687FF]/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">عروض خاصة</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            اكتشف أفضل الخصومات على المعدات والملابس الرياضية. لا تفوت هذه العروض المحدودة.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">{t('products.loadingProducts') || 'جارٍ تحميل المنتجات'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-xl font-bold text-white">لا توجد عروض حالياً</p>
            <p className="text-sm text-slate-400 max-w-xs">جميع العروض قد انتهت أو لا توجد منتجات مخفضة في الوقت الحالي. تحقق لاحقاً!</p>
            <Link href="/products" className="mt-4 px-6 py-2.5 rounded-full bg-[#1687FF] text-white font-bold text-sm hover:bg-[#2563EB] transition-colors">
              تصفح جميع المنتجات
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const isDiscounted = product.originalPrice && Number(product.originalPrice) > Number(product.price);
                return (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group relative flex flex-col rounded-[1.25rem] bg-[#050B14]/80 border border-white/10 shadow-lg backdrop-blur-md overflow-hidden hover:border-[#1687FF]/50 transition-all cursor-pointer">
                    <div className="relative aspect-square w-full flex items-center justify-center bg-transparent p-4">
                      {/* Badge */}
                      {isDiscounted && (
                        <div className="absolute top-3 right-3 z-10 bg-[#1687FF] text-white text-[11px] font-black px-2 py-1 rounded shadow-[0_0_12px_rgba(22,135,255,0.5)]">
                          -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                        </div>
                      )}

                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xl p-2"
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-1 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
                      <h3 className="mb-1 line-clamp-1 text-sm font-bold text-white group-hover:text-[#1687FF] transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="mb-3 line-clamp-1 text-[11px] text-slate-400">{product.category?.name || product.description}</p>

                      <div className="mt-auto flex flex-col gap-1 mb-3">
                        {isDiscounted && (
                          <span className="text-[12px] font-medium text-slate-500 relative inline-block w-fit after:absolute after:left-0 after:top-1/2 after:h-[1.5px] after:w-full after:-translate-y-1/2 after:bg-[#1687FF] after:rounded-full">
                            {formatDZD(Number(product.originalPrice))}
                          </span>
                        )}
                        <span className="text-xl font-black text-[#1687FF] drop-shadow-[0_0_10px_rgba(22,135,255,0.4)]">
                          {formatDZD(Number(product.price))}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className={`w-full font-bold rounded-full h-10 ${inStock(product) ? 'bg-[#1687FF] hover:bg-[#2563EB] text-white shadow-[0_0_15px_rgba(22,135,255,0.3)] hover:shadow-[0_0_20px_rgba(22,135,255,0.5)]' : 'bg-white/10 text-slate-400'}`}
                        disabled={!inStock(product)}
                      >
                        {inStock(product) ? (
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            <span>{t('products.btnView') || 'عرض المنتج'}</span>
                          </div>
                        ) : t('products.btnOutOfStock')}
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-full px-6"
                >
                  {t('products.prevPage') || 'السابق'}
                </Button>
                <span className="text-sm text-slate-400">
                  {page} / {totalPages}
                </span>
                <Button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-full px-6"
                >
                  {t('products.nextPage') || 'التالي'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <MobileBottomNav />
      <div className="hidden md:block mt-auto border-t border-white/5">
        <Footer />
      </div>
    </div>
  )
}

export default function OffersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020817]" />}>
      <OffersPageContent />
    </Suspense>
  )
}
