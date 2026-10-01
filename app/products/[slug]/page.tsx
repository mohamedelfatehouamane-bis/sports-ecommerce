'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart, ShieldAlert, Shirt } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { useTranslation as useAppTranslation } from '@/components/language-context'
import { formatDZD } from '@/lib/utils/currency'
import { showToast } from '@/components/Toast'
import { ProductImage } from '@/components/ProductImage'

export const dynamic = 'force-dynamic'

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string
  price: string | number
  originalPrice?: string | number | null
  stock: number
  imageUrl: string | null
  availableSizes: string[]
  category: { id: string; name: string; slug: string }
  variants?: { id: string; size: string | null; color: string | null; quantity: number }[]
}

interface ProductResponse {
  product: ProductDetail
}

export default function ProductDetailPage({ 
  params: paramsProp
}: { 
  params: Promise<{ slug: string }> | { slug: string } 
}) {
  const { t, language } = useAppTranslation()
  const resolvedParams = paramsProp instanceof Promise ? React.use(paramsProp) : paramsProp
  
  const rawSlug = resolvedParams.slug
  const slug = rawSlug.replace(/-+$/g, '')

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [colorError, setColorError] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y })
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    let hasError = false
    if (derivedSizes.length > 0 && !selectedSize) {
      setSizeError(true)
      hasError = true
    } else {
      setSizeError(false)
    }

    if (derivedColors.length > 0 && !selectedColor) {
      setColorError(true)
      hasError = true
    } else {
      setColorError(false)
    }

    if (hasError) {
      showToast('يرجى اختيار الخيارات المطلوبة', 'error')
      return
    }
    
    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity, size: selectedSize, color: selectedColor }),
      })
      if (res.ok) {
        showToast('تمت إضافة المنتج إلى السلة', 'success', { label: 'عرض السلة', href: '/cart' })
        window.dispatchEvent(new Event('cartUpdated'))
      } else {
        const data = await res.json().catch(() => ({}))
        if (data.error === 'limit_reached') {
          showToast('تم الوصول إلى الحد الأقصى للشراء', 'error')
        } else if (res.status === 404) {
          showToast('المنتج غير متوفر أو نفدت كميته', 'error')
        } else {
          showToast('تعذر إضافة المنتج إلى السلة', 'error')
        }
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      showToast('حدث خطأ أثناء إضافة المنتج إلى السلة', 'error')
    } finally {
      setAdding(false)
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`)
        if (!response.ok) {
          setError('Product not found. Please check the URL or try another product.')
          setLoading(false)
          return
        }
        const data: ProductResponse = await response.json()
        if (!data?.product) {
          setError('Product data is missing from the response.')
          setLoading(false)
          return
        }
        setProduct(data.product)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-[#1687FF] animate-spin mb-4" />
          <p className="text-slate-400 text-sm">جارٍ تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h1 className="mb-4 text-2xl font-bold text-white">{error || 'لم يتم العثور على المنتج'}</h1>
          <Link href="/products">
            <Button className="bg-[#1687FF] hover:bg-[#2563EB] text-white rounded-full px-6">العودة إلى المنتجات</Button>
          </Link>
        </div>
      </div>
    )
  }

  const inStock = product.stock > 0

  const handleIncrement = () => {
    if (quantity < (product.stock || 1)) setQuantity(q => q + 1)
  }

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(q => q - 1)
  }

  const derivedSizes = product.variants && product.variants.length > 0
    ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] as string[]
    : product.availableSizes || []
  const derivedColors = product.variants && product.variants.length > 0
    ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] as string[]
    : []

  return (
    <div className="relative min-h-screen bg-[#020817] flex flex-col pb-20 overflow-hidden">
      {/* Background Overlay to ensure contrast while keeping atmosphere */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,135,255,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(2,8,23,0.95),rgba(2,8,23,1)_60%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-12 w-full flex-1">
          <div className="grid gap-8 md:gap-16 lg:grid-cols-2">
            
            {/* Product Visual Area */}
            <div className="flex flex-col space-y-4">
              <div 
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                className="relative aspect-[4/5] md:aspect-square w-full rounded-3xl border border-white/5 bg-[#0a1128] overflow-hidden shadow-2xl flex items-center justify-center cursor-zoom-in group"
              >
                {/* Decorative glow behind image */}
                <div className="absolute inset-0 bg-[#1687FF]/5 rounded-full blur-[100px] pointer-events-none" />
                
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <div className="absolute top-4 right-4 z-10 bg-[#1687FF] text-white text-sm font-black px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(22,135,255,0.5)]">
                    -{Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}%
                  </div>
                )}
                
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: 'scale(1.8)',
                        }
                      : undefined
                  }
                  className="object-contain p-8 transition-transform duration-200 ease-out"
                />
              </div>
            </div>

            {/* Product Info Area */}
            <div className="flex flex-col justify-center space-y-6 md:space-y-8">
              
              {/* Category & Title */}
              <div className="space-y-3 text-center md:text-start">
                {product.category && (
                  <Link href={`/products?category=${product.category.slug}`}>
                    <span className="inline-block rounded-full bg-[#1687FF]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1687FF] transition-colors hover:bg-[#1687FF]/20 border border-[#1687FF]/20">
                      {product.category.name}
                    </span>
                  </Link>
                )}
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight break-words">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex flex-col items-center md:items-start gap-1">
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <span className="text-xl md:text-2xl font-bold text-slate-500 relative inline-block w-fit after:absolute after:left-0 after:top-1/2 after:h-[2px] after:w-full after:-translate-y-1/2 after:bg-[#1687FF] after:rounded-full">
                    {formatDZD(Number(product.originalPrice))}
                  </span>
                )}
                <span className="text-4xl md:text-5xl font-black text-[#1687FF] font-mono tracking-tight drop-shadow-[0_0_15px_rgba(22,135,255,0.3)]">
                  {formatDZD(Number(product.price))}
                </span>
              </div>

              {/* Delivery Notice */}
              <div className="flex items-start gap-3 rounded-2xl border border-[#1687FF]/20 bg-[#050B14] p-4 shadow-lg mx-auto md:mx-0 max-w-lg">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#1687FF]" />
                <p className="text-sm leading-relaxed text-slate-200 font-medium text-start">
                  سعر التوصيل غير شامل في السعر. يتم دفع رسوم التوصيل بشكل منفصل لشركة التوصيل.
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-3 text-center md:text-start">
                  <h3 className="text-lg font-bold text-white hidden md:block">الوصف</h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Sizes */}
              {derivedSizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase text-slate-400">المقاسات المتوفرة</h3>
                    {sizeError && <span className="text-xs font-bold text-rose-400 animate-pulse">مطلوب</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {derivedSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size)
                          setSizeError(false)
                        }}
                        className={`h-12 min-w-[3rem] px-4 rounded-xl border text-sm font-bold transition-colors flex items-center justify-center ${
                          selectedSize === size
                            ? 'bg-[#1687FF] border-[#1687FF] text-white shadow-[0_0_15px_rgba(22,135,255,0.4)]'
                            : sizeError 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                              : 'bg-[#0a1128] border-white/10 text-slate-300 hover:border-[#1687FF]/50 hover:bg-[#1687FF]/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {derivedColors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase text-slate-400">الألوان المتوفرة</h3>
                    {colorError && <span className="text-xs font-bold text-rose-400 animate-pulse">مطلوب</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {derivedColors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          setColorError(false)
                        }}
                        className={`h-12 px-4 rounded-xl border text-sm font-bold transition-colors flex items-center justify-center ${
                          selectedColor === color
                            ? 'bg-[#1687FF] border-[#1687FF] text-white shadow-[0_0_15px_rgba(22,135,255,0.4)]'
                            : colorError 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                              : 'bg-[#0a1128] border-white/10 text-slate-300 hover:border-[#1687FF]/50 hover:bg-[#1687FF]/10'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls Area (Stock, Qty, Add to Cart) */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                
                {/* Stock Status */}
                <div className="flex justify-center md:justify-start">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm ${
                    inStock 
                      ? 'border-emerald-500/20 bg-emerald-500/10' 
                      : 'border-rose-500/20 bg-rose-500/10'
                  }`}>
                    <span className="relative flex h-2.5 w-2.5">
                      {inStock && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                        inStock ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    <span className={`text-sm font-bold ${
                      inStock ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {inStock ? t('details.inStock') : t('details.outOfStock')}
                    </span>
                  </div>
                </div>

                {/* Quantity and Add to Cart Row */}
                <div className="flex flex-col gap-5">
                  {/* Quantity Selector */}
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-xs font-bold uppercase text-slate-400 md:ms-2">{t('details.qty')}</span>
                    <div className="flex h-14 w-full md:w-[160px] items-center rounded-full border border-white/10 bg-[#020817] shadow-inner">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="flex h-full flex-1 items-center justify-center rounded-s-full text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1687FF]"
                        aria-label="Decrease quantity"
                      >
                        <span className="text-2xl font-medium leading-none mb-1">−</span>
                      </button>
                      <div className="flex h-full w-14 items-center justify-center border-x border-white/10 text-lg font-bold text-white font-mono bg-white/5">
                        {quantity}
                      </div>
                      <button
                        onClick={handleIncrement}
                        disabled={!inStock || quantity >= (product.stock || 1)}
                        className="flex h-full flex-1 items-center justify-center rounded-e-full text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1687FF]"
                        aria-label="Increase quantity"
                      >
                        <span className="text-2xl font-medium leading-none mb-0.5">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    size="lg"
                    disabled={!inStock || adding}
                    onClick={handleAddToCart}
                    className="w-full h-14 rounded-full bg-[#1687FF] text-lg font-bold text-white shadow-[0_0_30px_rgba(22,135,255,0.4)] transition-all hover:bg-[#2563EB] hover:shadow-[0_0_40px_rgba(22,135,255,0.6)] disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                  >
                    <ShoppingCart className="me-3 h-6 w-6" />
                    {adding ? '...' : t('details.btnAddToCart')}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </main>

        <Footer />
      </div>
      
      <MobileBottomNav />
    </div>
  )
}
