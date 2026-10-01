'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStoreSettings } from '@/app/actions/store-settings'
import { MapPin, Phone, Mail, MessageSquare, Send, Check } from 'lucide-react'
import { useTranslation } from '@/components/language-context'

export default function ContactPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      const res = await getStoreSettings()
      if (res.success && res.settings) {
        setSettings(res.settings)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate contact form submission
    setSubmitted(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const formattedWhatsApp = settings?.whatsAppNumber
    ? `https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}`
    : null

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">{t('contact.title')}</h1>
          <p className="mt-4 text-sm text-slate-400">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Column 1: Info Cards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('contact.heading')}</h2>
            <p className="text-sm text-slate-400">
              {t('contact.desc')}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Address Widget */}
              {settings?.storeAddress && (
                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1687FF]/10 border border-[#1687FF]/20 flex items-center justify-center text-[#1687FF]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{t('contact.location')}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{settings.storeAddress}</p>
                </div>
              )}

              {/* Phone Widget */}
              {settings?.contactPhone && (
                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1687FF]/10 border border-[#1687FF]/20 flex items-center justify-center text-[#1687FF]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{t('contact.phone')}</h3>
                  <a href={`tel:${settings.contactPhone}`} className="text-xs text-slate-400 hover:text-white leading-relaxed block">
                    {settings.contactPhone}
                  </a>
                </div>
              )}

              {/* Email Widget */}
              {settings?.emailAddress && (
                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1687FF]/10 border border-[#1687FF]/20 flex items-center justify-center text-[#1687FF]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{t('contact.email')}</h3>
                  <a href={`mailto:${settings.emailAddress}`} className="text-xs text-slate-400 hover:text-white leading-relaxed block">
                    {settings.emailAddress}
                  </a>
                </div>
              )}

              {/* WhatsApp Widget */}
              {formattedWhatsApp && (
                <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md p-5 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{t('contact.whatsapp')}</h3>
                  <a href={formattedWhatsApp} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline leading-relaxed block font-medium">
                    {t('contact.whatsappDesc')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Send Message Form */}
          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md shadow-[0_0_30px_rgba(22,135,255,0.05)]">
            <h2 className="text-2xl font-bold text-white mb-6">{t('contact.sendTitle')}</h2>
            
            {submitted ? (
              <div className="rounded-2xl border border-emerald-850 bg-emerald-950/30 p-6 text-center text-emerald-400 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white">{t('contact.successTitle')}</h3>
                <p className="text-xs text-slate-400">{t('contact.successDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('contact.name')}</label>
                    <Input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t('contact.namePlaceholder')}
                      className="bg-[#020817]/80 border-white/10 text-white focus:border-[#1687FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('contact.emailLabel')}</label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t('contact.emailPlaceholder')}
                      className="bg-[#020817]/80 border-white/10 text-white focus:border-[#1687FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('contact.subject')}</label>
                  <Input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={t('contact.subjectPlaceholder')}
                    className="bg-[#020817]/80 border-white/10 text-white focus:border-[#1687FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t('contact.message')}</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={5}
                    className="w-full rounded-xl border border-white/10 bg-[#020817]/80 px-3 py-2 text-white text-sm focus:border-[#1687FF] outline-none transition-colors"
                  />
                </div>

                <Button type="submit" className="w-full rounded-full bg-[#1687FF] text-white hover:bg-[#2563EB] font-bold shadow-[0_0_20px_rgba(22,135,255,0.2)] h-11 transition-all">
                  <Send className="h-4 w-4 mr-2" />
                  {t('contact.btnSend')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  )
}
