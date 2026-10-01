'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { processGuestCheckout } from '@/app/actions/guest-checkout'
import { useRouter } from 'next/navigation'
import { formatDZD } from '@/lib/utils/currency'
import { useTranslation } from '@/components/language-context'
import { getDeliveryRate, AVAILABLE_WILAYAS } from '@/lib/delivery-rates'

interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  size?: string
}

interface GuestCheckoutFormProps {
  cartItems: CartItem[]
  subtotal: number
  tax: number
  total: number
}

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Beni Abbès', 'In Guezzam', 'In Salah', 'Touggourt', 'Djanet',
  'El M\'Ghair', 'El Meniaa',
].filter(w => AVAILABLE_WILAYAS.some(aw => aw.toLowerCase() === w.toLowerCase()))

const WILAYAS_AR: Record<string, string> = {
  'Adrar': 'أدرار', 'Chlef': 'الشلف', 'Laghouat': 'الأغواط', 'Oum El Bouaghi': 'أم البواقي',
  'Batna': 'باتنة', 'Béjaïa': 'بجاية', 'Biskra': 'بسكرة', 'Béchar': 'بشار', 'Blida': 'البليدة',
  'Bouira': 'البويرة', 'Tamanrasset': 'تمنراست', 'Tébessa': 'تبسة', 'Tlemcen': 'تلمسان',
  'Tiaret': 'تيارت', 'Tizi Ouzou': 'تيزي وزو', 'Algiers': 'الجزائر العاصمة', 'Djelfa': 'الجلفة',
  'Jijel': 'جيجل', 'Sétif': 'سطيف', 'Saïda': 'سعيدة', 'Skikda': 'سكيكدة', 'Sidi Bel Abbès': 'سيدي بلعباس',
  'Annaba': 'عنابة', 'Guelma': 'قالمة', 'Constantine': 'قسنطينة', 'Médéa': 'المدية',
  'Mostaganem': 'مستغانم', 'M\'Sila': 'المسيلة', 'Mascara': 'معسكر', 'Ouargla': 'ورقلة',
  'Oran': 'وهران', 'El Bayadh': 'البيض', 'Illizi': 'إليزي', 'Bordj Bou Arreridj': 'برج بوعريريج',
  'Boumerdès': 'بومرداس', 'El Tarf': 'الطارف', 'Tindouf': 'تندوف', 'Tissemsilt': 'تيسمسيلت',
  'El Oued': 'الوادي', 'Khenchela': 'خنشلة', 'Souk Ahras': 'سوق أهراس', 'Tipaza': 'تيبازة',
  'Mila': 'ميلة', 'Aïn Defla': 'عين الدفلى', 'Naâma': 'النعامة', 'Aïn Témouchent': 'عين تموشنت',
  'Ghardaïa': 'غرداية', 'Relizane': 'غليزان', 'Beni Abbès': 'بني عباس', 'In Guezzam': 'عين قزام',
  'In Salah': 'عين صالح', 'Touggourt': 'تقرت', 'Djanet': 'جانت', 'El M\'Ghair': 'المغير',
  'El Meniaa': 'المنيعة',
}

const CITIES_BY_WILAYA: Record<string, string[]> = {
  'Algiers': ['Algiers', 'Bab El Oued', 'Casbah', 'Dar El Beïda', 'El Harrach', 'Hydra', 'Kouba', 'Sidi M\'Hamed', 'Zeralda'],
  'Oran': ['Oran', 'Bir El Djir', 'Es Senia', 'Arzew', 'Gdyel', 'Mers El Kébir', 'Oued Tlelat'],
  'Constantine': ['Constantine', 'El Khroub', 'Hamma Bouziane', 'Didouche Mourad', 'Zighoud Youcef'],
  'Annaba': ['Annaba', 'El Bouni', 'Sidi Amar', 'El Hadjar', 'Berrahal'],
  'Sétif': ['Sétif', 'El Eulma', 'Bouandas', 'Aïn Arnat', 'Salah Bey'],
  'Blida': ['Blida', 'Ouled Yaïch', 'Boufarik', 'Beni Mered', 'Larbaa'],
  'Tlemcen': ['Tlemcen', 'Mansourah', 'Maghnia', 'Ghazaouet', 'Sebdou'],
  'Béjaïa': ['Béjaïa', 'Akbou', 'Amizour', 'Kherrata', 'Sidi Aïch'],
  'Batna': ['Batna', 'Barika', 'Arris', 'Merouana', 'Aïn Touta'],
}

const CITIES_BY_WILAYA_AR: Record<string, string[]> = {
  'Algiers': ['الجزائر الوسطى', 'باب الواد', 'القصبة', 'الدار البيضاء', 'الحراش', 'حيدرة', 'القبة', 'سيدي امحمد', 'زرالدة'],
  'Oran': ['وهران', 'بئر الجير', 'السانية', 'ارزيو', 'قديل', 'المرسى الكبير', 'وادي تليلات'],
  'Constantine': ['قسنطينة', 'الخروب', 'حامة بوزيان', 'ديدوش مراد', 'زيغود يوسف'],
  'Annaba': ['عنابة', 'البوني', 'سيدي عمار', 'الحجار', 'برحال'],
  'Sétif': ['سطيف', 'العلمة', 'بوعنداس', 'عين أرنات', 'صالح باي'],
  'Blida': ['البليدة', 'أولاد يعيش', 'بوفاريك', 'بني مراد', 'الأربعاء'],
  'Tlemcen': ['تلمسان', 'منصورة', 'مغنية', 'الغزوات', 'سبدو'],
  'Béjaïa': ['بجاية', 'أقبو', 'أميزور', 'خراطة', 'سيدي عيش'],
  'Batna': ['باتنة', 'بريكة', 'أريس', 'مروانة', 'عين التوتة'],
}

export function GuestCheckoutForm({ cartItems, subtotal, tax, total }: GuestCheckoutFormProps) {
  const { t, language } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    wilaya: '',
    commune: '',
    address: '',
  })

  const isAr = language === 'ar'
  const citiesSource = isAr ? CITIES_BY_WILAYA_AR : CITIES_BY_WILAYA
  const availableCities = formData.wilaya
    ? citiesSource[formData.wilaya] || (isAr ? [
        `وسط مدينة ${WILAYAS_AR[formData.wilaya] || formData.wilaya}`,
        `شمال ${WILAYAS_AR[formData.wilaya] || formData.wilaya}`,
        `جنوب ${WILAYAS_AR[formData.wilaya] || formData.wilaya}`,
        `شرق ${WILAYAS_AR[formData.wilaya] || formData.wilaya}`,
        `غرب ${WILAYAS_AR[formData.wilaya] || formData.wilaya}`,
      ] : [
        `${formData.wilaya} City Center`,
        `${formData.wilaya} North`,
        `${formData.wilaya} South`,
        `${formData.wilaya} East`,
        `${formData.wilaya} West`,
      ])
    : []

  const deliveryMethod = formData.address.trim() === '' ? 'STOP_DESK' : 'HOME'
  const deliveryFee = formData.wilaya ? getDeliveryRate(formData.wilaya, deliveryMethod as any) : null


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'wilaya') {
        updated.commune = ''
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.wilaya) {
      setError(t('checkout.selectWilayaError'))
      return
    }
    if (!formData.commune) {
      setError(t('checkout.selectCityError'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await processGuestCheckout({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        wilaya: formData.wilaya,
        commune: formData.commune,
        address: formData.address || '',
        cartItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
        idempotencyKey,
      })

      if (!result.success) {
        setError(result.error || 'Checkout failed')
        return
      }

      router.push(`/checkout/success?orderCode=${result.orderCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 text-slate-200">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)]">
          <h2 className="mb-6 text-2xl font-extrabold text-white">{t('checkout.title')}</h2>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-900 bg-rose-950/20 p-4 text-rose-400">
              <p className="font-bold">{t('checkout.errorHeader')}</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="mb-4 font-bold text-base text-[#1687FF] border-b border-white/5 pb-2 uppercase tracking-wider">{t('checkout.customerDetails')}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('checkout.fullName')}</label>
                  <Input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder={t('checkout.fullNamePlaceholder')}
                    className="border-white/10 bg-[#020817]/80 text-white placeholder:text-slate-500 focus:border-[#1687FF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('checkout.phone')}</label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder={t('checkout.phonePlaceholder')}
                    className="border-white/10 bg-[#020817]/80 text-white placeholder:text-slate-500 focus:border-[#1687FF]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-bold text-base text-[#1687FF] border-b border-white/5 pb-2 uppercase tracking-wider">{t('checkout.deliveryAddress')}</h3>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('checkout.wilaya')}</label>
                  <select
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border border-white/10 bg-[#020817]/80 px-3 py-2 text-sm text-white focus:border-[#1687FF] outline-none transition-colors"
                    required
                  >
                    <option value="">{t('checkout.selectWilaya')}</option>
                    {WILAYAS.map((w) => (
                      <option key={w} value={w}>
                        {isAr ? (WILAYAS_AR[w] || w) : w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('checkout.city')}</label>
                  <select
                    name="commune"
                    value={formData.commune}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border border-white/10 bg-[#020817]/80 px-3 py-2 text-sm text-white focus:border-[#1687FF] outline-none transition-colors"
                    disabled={!formData.wilaya}
                    required
                  >
                    <option value="">{t('checkout.selectCity')}</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t('checkout.homeAddress')}
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('checkout.addressPlaceholder')}
                  className="w-full min-h-[80px] rounded-xl border border-white/10 bg-[#020817]/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1687FF] outline-none transition-colors"
                />
              </div>
            </div>


            {formData.wilaya ? (
              <div className="rounded-2xl border border-[#1687FF]/20 bg-[#1687FF]/10 p-4 text-sm text-[#1687FF]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">طريقة التوصيل</span>
                  <span className="font-bold text-white">{deliveryMethod === 'STOP_DESK' ? 'المكتب التحويل' : 'التوصيل إلى المنزل'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">رسوم التوصيل</span>
                  <span className="font-bold text-white">
                    {deliveryFee === null ? 'غير متوفر' : `${deliveryFee} دج`}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-white border-t border-[#1687FF]/20 pt-2">طريقة الدفع: الدفع عند الاستلام</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#1687FF]/20 bg-[#1687FF]/10 p-4 text-sm text-[#1687FF]">
                <p className="font-semibold text-white">يرجى اختيار الولاية لمعرفة رسوم التوصيل</p>
                <p className="mt-2 font-semibold text-white border-t border-[#1687FF]/20 pt-2">طريقة الدفع: الدفع عند الاستلام</p>
              </div>
            )}

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <h3 className="mb-3 font-bold text-sm text-slate-300 uppercase tracking-wider">{t('checkout.orderSummary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">مجموع المنتجات</span>
                  <span className="font-mono text-white">{formatDZD(subtotal)}</span>
                </div>
                {deliveryFee !== null && (
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">رسوم التوصيل</span>
                    <span className="font-mono text-white">{formatDZD(deliveryFee)}</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-2 mt-2">
                  <div className="flex justify-between font-black text-lg text-[#1687FF]">
                    <span>المجموع الإجمالي</span>
                    <span className="font-mono">{formatDZD(subtotal + (deliveryFee || 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-full bg-[#1687FF] hover:bg-[#2563EB] text-white font-bold h-12 shadow-[0_0_20px_rgba(22,135,255,0.3)] transition-all" size="lg">
              {loading ? t('checkout.btnProcessing') : t('checkout.btnPlaceOrder')}
            </Button>
            <p className="text-[10px] text-slate-500 text-center">
              {t('checkout.termsNotice')}
            </p>
          </form>
        </div>
      </div>

      <div>
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(22,135,255,0.05)] sticky top-24">
          <h3 className="mb-4 font-bold text-base text-[#1687FF] border-b border-white/5 pb-2 uppercase tracking-wider">{t('checkout.orderItems')}</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.productName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('checkout.qty')}: {item.quantity}
                    {item.size && ` | المقاس: ${item.size}`}
                  </p>
                </div>
                <p className="text-sm font-black text-white font-mono shrink-0">{formatDZD(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
