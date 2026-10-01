'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { Loader2, Search, Package, MapPin, Box } from 'lucide-react'
import { useTranslation } from '@/components/language-context'
import { formatDZD } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

interface TrackedOrder {
  orderCode: string
  orderStatus: string
  customerStatus: string
  productsTotal: number
  customerName: string
  phone: string
  address: string
  paymentMethod: string
  createdAt: string
  items: Array<{
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    size?: string
  }>
  history: Array<{
    status: string
    date: string
  }>
}

const statusSteps = ['ORDER_RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']

const statusColors = {
  ORDER_RECEIVED: 'bg-blue-950/40 text-blue-400 border-blue-800',
  PREPARING: 'bg-yellow-950/40 text-yellow-400 border-yellow-800',
  OUT_FOR_DELIVERY: 'bg-purple-950/40 text-purple-400 border-purple-800',
  DELIVERED: 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
  CANCELLED: 'bg-rose-950/40 text-rose-400 border-rose-800',
  RETURNED: 'bg-orange-950/40 text-orange-400 border-orange-800',
  DELIVERY_FAILED: 'bg-rose-950/40 text-rose-400 border-rose-800',
}

const statusNames: Record<string, string> = {
  ORDER_RECEIVED: 'تم استلام الطلب',
  PREPARING: 'جاري التحضير',
  OUT_FOR_DELIVERY: 'في الطريق إليك',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغى',
  RETURNED: 'مرتجع',
  DELIVERY_FAILED: 'فشل التوصيل'
}

export default function OrderTrackingPage() {
  const { t, language } = useTranslation()
  const [orderCode, setOrderCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<TrackedOrder | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderCode.trim()) {
      setError('الرجاء إدخال رمز الطلب المكون من 16 حرفاً')
      return
    }

    setLoading(true)
    setError(null)
    setSelectedOrder(null)

    try {
      const params = new URLSearchParams()
      params.append('code', orderCode.trim())

      const res = await fetch(`/api/orders/track?${params.toString()}`)
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('لم يتم العثور على الطلب. يرجى التحقق من الرمز والمحاولة مرة أخرى.')
        } else {
          const data = await res.json()
          throw new Error(data.error || 'فشل في تتبع الطلب')
        }
      }

      const data = await res.json()
      setSelectedOrder(data.order)
    } catch (err: any) {
      setError(err.message || 'لم يتم العثور على الطلب. يرجى التحقق من الرمز والمحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (order: TrackedOrder, step: string) => {
    const currentIdx = statusSteps.indexOf(order.customerStatus)
    const stepIdx = statusSteps.indexOf(step)

    if (currentIdx === -1) return 'upcoming' // cancelled/refunded
    if (stepIdx < currentIdx) return 'complete'
    if (stepIdx === currentIdx) return 'current'
    return 'upcoming'
  }

  const handleReset = () => {
    setSelectedOrder(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-6 py-16">
        <div className="mb-12 text-center max-w-lg mx-auto space-y-3">
          <Box className="h-10 w-10 text-[#008CFF] mx-auto" />
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">تتبع الطلب</h1>
          <p className="text-slate-400 text-sm">
            أدخل رمز الطلب للتحقق من حالة طلبك.
          </p>
        </div>

        {/* Tracking Lookup Form */}
        {!selectedOrder && (
          <div className="max-w-md mx-auto rounded-2xl border border-white/5 bg-white/5 p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] backdrop-blur-md">
            {error && (
              <div className="mb-6 rounded-xl border border-rose-800 bg-rose-955/40 p-4 text-rose-300 text-xs">
                <p className="font-bold">خطأ</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">رمز الطلب</label>
                <Input
                  type="text"
                  placeholder="K7M4-X9P2-R6TW-3N8Q"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                  className="bg-[#020817]/80 border-white/10 text-white focus:border-[#1687FF] font-mono text-center tracking-widest uppercase"
                />
              </div>

              <Button type="submit" className="w-full rounded-full bg-[#1687FF] hover:bg-[#2563EB] text-white font-bold h-11 shadow-[0_0_20px_rgba(22,135,255,0.2)] transition-all" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Search className="h-4 w-4 ms-2" />}
                تتبع الطلب
              </Button>
            </form>
          </div>
        )}

        {/* Tracking Details Display */}
        {selectedOrder && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs text-slate-400">رمز الطلب</p>
                <h2 className="text-2xl font-black flex items-center gap-2 mt-1">
                  <span className="text-white font-mono">{selectedOrder.orderCode}</span>
                </h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs px-6">
                  تتبع طلب آخر
                </Button>
              </div>
            </div>

            {/* Error States */}
            {['CANCELLED', 'RETURNED', 'DELIVERY_FAILED'].includes(selectedOrder.customerStatus) ? (
              <div className="rounded-xl bg-rose-955/20 border border-rose-800/40 p-8 text-center text-rose-300 space-y-4">
                <h3 className="text-xl font-bold">{statusNames[selectedOrder.customerStatus]}</h3>
                <p className="text-sm">
                  {selectedOrder.customerStatus === 'CANCELLED' && 'تم إلغاء هذا الطلب.'}
                  {selectedOrder.customerStatus === 'RETURNED' && 'تم إرجاع هذا الطلب إلى المتجر.'}
                  {selectedOrder.customerStatus === 'DELIVERY_FAILED' && 'لم تتمكن شركة التوصيل من إكمال التوصيل. يرجى انتظار محاولة توصيل أخرى أو الاتصال بشركة التوصيل.'}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)]">
                <h3 className="font-bold text-white text-base mb-6">مراحل التوصيل</h3>
                <div className="grid grid-cols-2 md:grid-flow-col md:grid-cols-4 gap-4">
                  {statusSteps.map((step, idx) => {
                    const stepStatus = getStepStatus(selectedOrder, step)
                    return (
                      <div key={step} className="flex flex-col items-center text-center">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm mb-2 border transition-colors ${
                          stepStatus === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow shadow-emerald-500/20' :
                          stepStatus === 'current' ? 'bg-[#1687FF] text-white border-[#2563EB] shadow-[0_0_15px_rgba(22,135,255,0.4)]' :
                          'bg-[#020817]/50 text-slate-500 border-white/5'
                        }`}>
                          {stepStatus === 'complete' ? '✓' : idx + 1}
                        </div>
                        <span className="text-xs font-semibold capitalize text-slate-300">{statusNames[step]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Order Info & Products */}
            {!['CANCELLED', 'RETURNED', 'DELIVERY_FAILED'].includes(selectedOrder.customerStatus) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Left: History & Info */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)]">
                    <h3 className="font-bold text-white text-base border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                      <Box className="h-4 w-4" /> معلومات الطلب
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">تاريخ الطلب:</span>
                        <span className="font-bold text-white">
                          {new Date(selectedOrder.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">طريقة الدفع:</span>
                        <span className="font-bold text-white capitalize">{selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'الدفع عند الاستلام' : selectedOrder.paymentMethod.replace(/_/g, ' ').toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)]">
                    <h3 className="font-bold text-white text-base border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> سجل الحالة
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.history && selectedOrder.history.length > 0 ? (
                        selectedOrder.history.map((h, i) => (
                          <div key={i} className="flex justify-between items-center text-sm border-l-2 border-[#008CFF] pl-4 py-1">
                            <span className="font-bold text-white">{h.status}</span>
                            <span className="text-slate-500 text-xs">
                              {new Date(h.date).toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center text-sm border-l-2 border-[#008CFF] pl-4 py-1">
                          <span className="font-bold text-white">{statusNames[selectedOrder.customerStatus]}</span>
                          <span className="text-slate-500 text-xs">
                            {new Date(selectedOrder.createdAt).toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-US', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Products */}
                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] h-fit">
                  <h3 className="font-bold text-white text-base border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" /> المنتجات المطلوبة
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-850 pb-3 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-white">{item.productName}</span>
                          <p className="text-slate-400 text-xs mt-0.5">
                            الكمية: {item.quantity}
                            {item.size && ` | المقاس: ${item.size}`}
                          </p>
                        </div>
                        <span className="font-bold text-white">{formatDZD(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-300">مجموع المنتجات</span>
                      <span className="font-black text-white text-lg">{formatDZD(Number(selectedOrder.productsTotal))}</span>
                    </div>
                    
                    <div className="bg-[#1687FF]/10 border border-[#1687FF]/30 rounded-xl p-4 text-xs text-[#1687FF] text-center font-semibold">
                      سعر التوصيل غير شامل في السعر. يتم دفع رسوم التوصيل بشكل منفصل لشركة التوصيل.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  )
}
