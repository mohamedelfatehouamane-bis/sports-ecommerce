'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { processGuestCheckout } from '@/app/actions/guest-checkout'
import { useRouter } from 'next/navigation'
import { formatDZD } from '@/lib/utils/currency'

interface CartItem {
  id: string
  variantId: string
  productName: string
  price: number
  quantity: number
  sku: string
}

interface GuestCheckoutFormProps {
  cartItems: CartItem[]
  subtotal: number
  tax: number
  total: number
}

const WILAYAS = [
  'Adrar',
  'Chlef',
  'Laghouat',
  'Oum El Bouaghi',
  'Batna',
  'Béjaïa',
  'Biski',
  'Béchar',
  'Blida',
  'Bouira',
  'Tamanrasset',
  'Tébessa',
  'Tlemcen',
  'Tiaret',
  'Tizi Ouzou',
  'Algiers',
  'Djelfa',
  'Jijel',
  'Sétif',
  'Saïda',
  'Skikda',
  'Sidi Bel Abbès',
  'Annaba',
  'Guelma',
  'Constantine',
  'Médéa',
  'Mostaghanem',
  'M\'Sila',
  'Mascara',
  'Ouargla',
  'Oran',
  'El Bayadh',
  'Illizi',
  'Bordj Bou Arreridj',
  'Boumerdès',
  'El Tarf',
  'Tindouf',
  'Tissemsilt',
  'El Oued',
  'Khenchela',
  'Souk Ahras',
  'Tipaza',
  'Mila',
  'Aïn Defla',
  'Naâma',
  'Aïn Témouchent',
  'Ghardaïa',
  'Relizane',
  'Beni Abbès',
  'In Guezzam',
  'In Salah',
  'Tamanrasset (Ahaggar)',
]

export function GuestCheckoutForm({ cartItems, subtotal, tax, total }: GuestCheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilaya: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await processGuestCheckout({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        wilaya: formData.wilaya,
        cartItems: cartItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      })

      if (!result.success) {
        setError(result.error || 'Checkout failed')
        return
      }

      // Redirect to order success page
      router.push(`/checkout/success?orderId=${result.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-6 text-2xl font-bold">Checkout</h2>

          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="mb-4 font-semibold">Personal Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h3 className="mb-4 font-semibold">Shipping Information</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Wilaya (Province)</label>
                  <select
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a wilaya...</option>
                    {WILAYAS.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>
                        {wilaya}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+213 600 000 000 or 0600000000"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Algerian phone numbers only. Format: +213XXXXXXXXX or 0XXXXXXXXX
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-4 font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatDZD(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (19%)</span>
                  <span>{formatDZD(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatDZD(150)}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatDZD(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Place Order'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By placing an order, you agree to our Terms of Service and will receive order updates via phone.
            </p>
          </form>
        </div>
      </div>

      {/* Order Items Sidebar */}
      <div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Order Items</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatDZD(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
