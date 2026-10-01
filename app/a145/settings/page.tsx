'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStoreSettings, updateStoreSettings } from '@/app/actions/store-settings'
import { uploadImageAction } from '@/app/actions/media'
import { compressImage } from '@/lib/utils/image-compressor'
import { 
  ArrowLeft, Save, Loader2, Info, Phone, MessageSquare, 
  Mail, MapPin, Share2, Upload, Image as ImageIcon
} from 'lucide-react'

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [form, setForm] = useState({
    storeName: 'Sports Shop',
    storeLogo: '',
    storeDescription: '',
    contactPhone: '',
    whatsAppNumber: '',
    emailAddress: '',
    storeAddress: '',
    facebookLink: '',
    instagramLink: '',
    tiktokLink: '',
  })

  useEffect(() => {
    async function loadSettings() {
      const res = await getStoreSettings()
      if (res.success && res.settings) {
        setForm({
          storeName: res.settings.storeName || 'Sports Shop',
          storeLogo: res.settings.storeLogo || '',
          storeDescription: res.settings.storeDescription || '',
          contactPhone: res.settings.contactPhone || '',
          whatsAppNumber: res.settings.whatsAppNumber || '',
          emailAddress: res.settings.emailAddress || '',
          storeAddress: res.settings.storeAddress || '',
          facebookLink: res.settings.facebookLink || '',
          instagramLink: res.settings.instagramLink || '',
          tiktokLink: res.settings.tiktokLink || '',
        })
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      // Compress the image client-side first
      const compressedBlob = await compressImage(file, 600, 600, 0.85)
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await uploadImageAction(formData)
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, storeLogo: res.url as string }))
        showNotification('success', 'Logo uploaded successfully!')
      } else {
        showNotification('error', res.error || 'Failed to upload logo.')
      }
    } catch (err) {
      console.error(err)
      showNotification('error', 'Error uploading logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateStoreSettings(form)
      if (res.success) {
        showNotification('success', 'Store settings saved successfully!')
      } else {
        showNotification('error', res.error || 'Failed to save settings.')
      }
    } catch (err) {
      showNotification('error', 'Error saving settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/a145" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-white">Store Settings</h1>
          </div>
          <Link href="/a145">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 border ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/90 border-rose-800 text-rose-300'
          }`}>
            <Info className="h-5 w-5" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 border border-slate-800 bg-slate-900/10 rounded-2xl">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading settings configurations...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-850 pb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">General Preferences</h2>
                <p className="text-xs text-slate-400 mt-1">Configure metadata, phone numbers, addresses and social accounts.</p>
              </div>
              <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 shadow-lg shadow-orange-600/20 h-10">
                {saving ? <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" /> : <Save className="h-4.5 w-4.5 mr-2" />}
                Save Settings
              </Button>
            </div>

            {/* Grid forms */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left Column: Logo & Branding */}
              <div className="space-y-6 md:col-span-1">
                <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-orange-500" /> Logo & Identity
                  </h3>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-950 text-center relative aspect-square group overflow-hidden">
                    {form.storeLogo ? (
                      <>
                        <img src={form.storeLogo} alt="Store Logo Preview" className="h-full w-full object-contain max-h-[140px]" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label className="cursor-pointer text-xs font-bold text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-800">
                            Change Image
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-slate-500">
                        <Upload className="h-8 w-8 mx-auto" />
                        <span className="block text-xs font-semibold">Upload Logo</span>
                        <span className="block text-[10px]">PNG, JPEG up to 5MB</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    )}

                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-orange-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  {form.storeLogo && (
                    <Button 
                      type="button" 
                      onClick={() => setForm(prev => ({ ...prev, storeLogo: '' }))}
                      variant="ghost" 
                      className="w-full text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300"
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column: Text Information */}
              <div className="space-y-6 md:col-span-2">
                {/* Store Meta Card */}
                <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    📢 Store Info
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Store Name *</label>
                      <Input
                        type="text"
                        name="storeName"
                        value={form.storeName}
                        onChange={handleInputChange}
                        required
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Store Description</label>
                      <textarea
                        name="storeDescription"
                        value={form.storeDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacts Settings Card */}
                <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    📞 Customer Support & Coordinates
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-orange-500" /> Contact Phone
                      </label>
                      <Input
                        type="text"
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleInputChange}
                        placeholder="+213 555 123 456"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-emerald-500" /> WhatsApp Number
                      </label>
                      <Input
                        type="text"
                        name="whatsAppNumber"
                        value={form.whatsAppNumber}
                        onChange={handleInputChange}
                        placeholder="213555123456 (with country code)"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-orange-500" /> Contact Email Address
                      </label>
                      <Input
                        type="email"
                        name="emailAddress"
                        value={form.emailAddress}
                        onChange={handleInputChange}
                        placeholder="support@mystore.com"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-orange-500" /> Physical Store Address
                      </label>
                      <Input
                        type="text"
                        name="storeAddress"
                        value={form.storeAddress}
                        onChange={handleInputChange}
                        placeholder="123 Shopping Avenue, Algiers, Algeria"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Social links Card */}
                <div className="rounded-2xl border border-slate-850 bg-slate-900/10 p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-orange-500" /> Social Links
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        <FacebookIcon className="h-3 w-3 text-blue-500" /> Facebook Page Link
                      </label>
                      <Input
                        type="url"
                        name="facebookLink"
                        value={form.facebookLink}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/my-shop"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        <InstagramIcon className="h-3 w-3 text-pink-500" /> Instagram Profile Link
                      </label>
                      <Input
                        type="url"
                        name="instagramLink"
                        value={form.instagramLink}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/my-shop"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                        🎵 TikTok Profile Link
                      </label>
                      <Input
                        type="url"
                        name="tiktokLink"
                        value={form.tiktokLink}
                        onChange={handleInputChange}
                        placeholder="https://tiktok.com/@my-shop"
                        className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
