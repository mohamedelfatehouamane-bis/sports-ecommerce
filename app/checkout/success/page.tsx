'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDZD } from '@/lib/utils/currency'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Loader2, CheckCircle, ShieldAlert, Sparkles, ShoppingBag, Download } from 'lucide-react'
import { useTranslation } from '@/components/language-context'

export const dynamic = 'force-dynamic'

interface OrderDetails {
  orderCode: string
  orderStatus: string
  productsTotal: number
  customerName: string
  phone: string
  address: string
  paymentMethod: string
  deliveryMethod?: string
  deliveryFee?: number
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  createdAt: string
}

function OrderSuccessContent() {
  const { t, language } = useTranslation()
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('orderCode')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderCode) return

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/track?code=${orderCode}`)
        if (!res.ok) throw new Error('Failed to fetch order')
        const data = await res.json()
        setOrder(data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderCode])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-[#1687FF] animate-spin mb-4" />
          <p className="text-slate-400 text-sm">{t('success.loading')}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-2xl px-6 py-20 flex items-center justify-center">
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-12 text-center w-full shadow-[0_0_30px_rgba(22,135,255,0.05)]">
            <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h1 className="mb-2 text-2xl font-bold text-white">{t('success.notFoundTitle')}</h1>
            <p className="mb-6 text-xs text-slate-400">
              {t('success.notFoundDesc')}
            </p>
            <Link href="/">
              <Button className="rounded-full bg-[#1687FF] hover:bg-[#2563EB] text-white font-bold px-6">{t('success.btnBackHome')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-6 py-12 print:py-4">
        {/* Success Header */}
        <div className="mb-8 rounded-2xl border border-[#1687FF]/20 bg-[#1687FF]/10 p-8 text-center space-y-4 shadow-[0_0_30px_rgba(22,135,255,0.15)] print:border-b print:border-gray-200 print:bg-transparent print:shadow-none print:p-4 print:mb-4">
          <div className="h-14 w-14 rounded-full bg-[#1687FF]/20 border border-[#1687FF]/40 flex items-center justify-center mx-auto text-[#1687FF] print:hidden">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white print:text-black">{t('success.confirmed')}</h1>
            <p className="text-sm text-slate-400 mt-2 print:text-black">
              رمز الطلب: <span className="font-mono font-bold text-[#1687FF] print:text-black text-lg">{order.orderCode}</span>
            </p>
            <p className="text-xs text-slate-300 mt-1 print:text-black font-bold">
              احتفظ بهذا الرمز للتحقق من حالة طلبك لاحقاً.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 print:grid print:grid-cols-2 print:gap-4 print:text-sm">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 print:col-span-1 print:space-y-4">
            {/* Customer Information */}
            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] print:p-0 print:border-none print:shadow-none print:bg-transparent">
              <h2 className="mb-4 font-bold text-white print:text-black text-base border-b border-white/5 print:border-gray-200 pb-3">{t('success.customerInfo')}</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <div>
                  <p className="text-slate-400 print:text-gray-600 font-medium">{t('success.name')}</p>
                  <p className="font-bold text-slate-200 print:text-black mt-0.5">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-gray-600 font-medium">{t('success.phone')}</p>
                  <p className="font-bold text-slate-200 print:text-black mt-0.5">{order.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-gray-600 font-medium">تاريخ طلب التوصيل</p>
                  <p className="font-bold text-slate-200 print:text-black mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 print:text-gray-600 font-medium">{t('success.shippingAddress')}</p>
                  <p className="font-bold text-slate-200 print:text-black mt-0.5 whitespace-pre-line">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] print:p-0 print:border-none print:shadow-none print:bg-transparent">
              <h2 className="mb-4 font-bold text-white print:text-black text-base border-b border-white/5 print:border-gray-200 pb-3">{t('success.orderItems')}</h2>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-white/5 print:border-gray-200 pb-3 last:border-0">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 print:text-black text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-slate-400 print:text-gray-600 mt-1">{t('success.quantity')}: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black font-mono text-white print:text-black text-sm">{formatDZD(item.subtotal)}</p>
                      <p className="text-xs text-slate-400 print:text-gray-500 font-mono mt-0.5">{formatDZD(item.unitPrice)}/{t('success.unit')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Disclaimer removed as requested */}
          </div>

          {/* Order Summary Sidebar */}
          <div className="h-fit rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 sticky top-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] space-y-6 print:col-span-1 print:p-0 print:border-none print:bg-transparent print:shadow-none">
            <h2 className="font-bold text-white print:text-black text-base border-b border-white/5 print:border-gray-200 pb-3">{t('success.orderSummary')}</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">مجموع المنتجات</span>
                <span className="font-mono text-white print:text-black font-bold">{formatDZD(order.productsTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 print:text-black font-bold border-t border-white/5 print:border-gray-200 pt-2">
                <span>رسوم التوصيل ({order.deliveryMethod === 'DESK' ? 'للمكتب' : 'للمنزل'})</span>
                <span>{order.deliveryFee ? formatDZD(order.deliveryFee) : 'غير شامل'}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-white/5 print:border-gray-400 mt-2">
                <span className="print:text-black">المجموع الإجمالي</span>
                <span className="font-mono text-white print:text-black">{formatDZD(Number(order.productsTotal) + Number(order.deliveryFee || 0))}</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#020817] border border-white/10 p-4 space-y-2 text-xs print:border-gray-200 print:bg-transparent">
              <p className="text-slate-400 print:text-black">حالة الطلب</p>
              <p className="text-sm font-bold text-white print:text-black capitalize">تم استلام الطلب</p>
            </div>

            <div className="space-y-2 pt-2 print:hidden">
              <Button onClick={handlePrint} variant="outline" className="w-full rounded-full border-[#1687FF] text-[#1687FF] bg-transparent hover:bg-[#1687FF]/10 font-bold h-11 transition-all">
                <Download className="h-4 w-4 mr-2" />
                تنزيل الفاتورة (PDF)
              </Button>
              <Link href="/" className="block">
                <Button className="w-full rounded-full bg-[#1687FF] hover:bg-[#2563EB] text-white font-bold h-11 shadow-[0_0_20px_rgba(22,135,255,0.2)]">
                  {t('success.btnBackHome')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}

function OrderSuccessFallback() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 text-[#1687FF] animate-spin mx-auto" />
        <h1 className="text-xl font-bold">{t('success.loading')}</h1>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessContent />
    </Suspense>
  )
}
