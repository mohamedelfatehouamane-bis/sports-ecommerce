'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDZD } from '@/lib/utils/currency'
import { ProductImage } from '@/components/ProductImage'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { useTranslation } from '@/components/language-context'
import { LayoutGrid, Shirt, Dumbbell, Backpack, SportShoe, ShoppingCart } from 'lucide-react'

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
  description: string
  price: number | string
  originalPrice?: number | string | null
  stock: number
  imageUrl: string
  category: { name: string; slug: string }
}

interface PaginatedResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function ProductsPageContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('sort', sortBy)
      params.append('page', page.toString())

      const response = await fetch(`/api/products?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      const fetchedProducts = data.products || []
      
      setProducts(fetchedProducts)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, sortBy, page])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedCategory, sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const inStock = (product: Product) => {
    return product.stock > 0
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-200 flex flex-col">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-8 flex-1 w-full">
        <h1 className="mb-8 text-4xl font-extrabold theme-text-white">{t('products.title')}</h1>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          <div className="flex overflow-x-auto gap-3 hide-scrollbar pb-2 touch-pan-x overscroll-x-contain">
            {[
              { name: t('products.allCategories'), Icon: LayoutGrid, slug: '' },
              { name: t('categories.shoes'), Icon: SportShoe, slug: 'shoes' },
              { name: t('categories.apparel'), Icon: Shirt, slug: 'apparel' },
              { name: t('categories.accessories'), Icon: Backpack, slug: 'accessories' },
              { name: t('categories.fitness'), Icon: Dumbbell, slug: 'fitness' },
              { name: t('categories.balls'), Icon: SoccerBallIcon, slug: 'balls' }
            ].map((cat) => {
              const isActive = selectedCategory === cat.slug
              return (
                <button 
                  key={cat.slug || 'all'} 
                  onClick={() => {
                    setSelectedCategory(cat.slug)
                    setPage(1)
                  }}
                  className={`group shrink-0 select-none flex flex-col items-center justify-center w-[72px] h-[80px] rounded-2xl transition-colors ${
                    isActive 
                      ? 'bg-[#1a2b4c] border border-[#1687FF]/50 shadow-[0_0_15px_rgba(22,135,255,0.15)]' 
                      : 'bg-[#0a1120] border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`mb-1.5 transition-colors ${isActive ? 'text-[#1687FF]' : 'text-white/60 group-hover:text-white/90'}`}>
                    <cat.Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              placeholder={t('products.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 theme-input placeholder:text-slate-500 bg-[#020817]/80 border-white/10 text-white focus:border-[#1687FF]"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#020817] px-4 py-2 text-white outline-none focus:border-[#1687FF] text-sm"
            >
              <option value="newest">{t('products.sortNewest')}</option>
              <option value="price-low">{t('products.sortPriceLow')}</option>
              <option value="price-high">{t('products.sortPriceHigh')}</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="theme-text-muted">{t('products.loadingProducts') || 'جارٍ تحميل المنتجات'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="theme-text-muted">{t('products.noProducts')}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const isDiscounted = product.originalPrice && Number(product.originalPrice) > Number(product.price);
                return (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group relative flex flex-col rounded-[1.25rem] bg-[#0a1120] border border-white/10 shadow-lg overflow-hidden hover:border-[#1687FF]/50 transition-colors cursor-pointer select-none">
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
                        className="object-contain transition-transform duration-300 md:group-hover:scale-110 drop-shadow-xl p-2"
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
            <div className="mt-12 flex items-center justify-center gap-4">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-full px-6"
              >
                Previous
              </Button>
              <span className="text-slate-400 text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-full px-6"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      <MobileBottomNav />
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020817]" />}>
      <ProductsPageContent />
    </Suspense>
  )
}
