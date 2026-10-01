'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStoreSettings } from '@/app/actions/store-settings'
import { Phone, MessageSquare, Mail, MapPin } from 'lucide-react'
import { useTranslation } from '@/components/language-context'

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

export function Footer() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<{
    storeName: string
    storeLogo: string | null
    storeDescription: string | null
    contactPhone: string | null
    whatsAppNumber: string | null
    emailAddress: string | null
    storeAddress: string | null
    facebookLink: string | null
    instagramLink: string | null
    tiktokLink: string | null
  }>({
    storeName: 'TG SPORT',
    storeLogo: null,
    storeDescription: 'Premium sports equipment and apparel.',
    contactPhone: null,
    whatsAppNumber: null,
    emailAddress: null,
    storeAddress: null,
    facebookLink: null,
    instagramLink: null,
    tiktokLink: null,
  })

  useEffect(() => {
    async function loadSettings() {
      const res = await getStoreSettings()
      if (res.success && res.settings) {
        setSettings(res.settings)
      }
    }
    loadSettings()
  }, [])

  const formattedWhatsApp = settings.whatsAppNumber
    ? `https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}`
    : null

  return (
    <footer className="bg-[#020817] border-t border-white/5 text-slate-400 py-12 px-6 mt-auto transition-colors duration-200 pb-28 lg:pb-12">
      <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-4">
        {/* Column 1: Store Intro */}
        <div className="space-y-4">
          <Link href="/" className="text-lg font-bold tracking-wider uppercase flex items-center gap-2">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <div className="h-6 w-6 rounded bg-[#1687FF] text-white flex items-center justify-center font-bold text-xs">
                {settings.storeName.charAt(0).toUpperCase()}
              </div>
              <span dir="ltr">
                {settings.storeName.split(' ')[0]} <span className="text-[#1687FF]">{settings.storeName.split(' ').slice(1).join(' ')}</span>
              </span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-slate-400">
            {settings.storeDescription}
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.navigation')}</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/products" className="hover:text-white transition-colors">{t('footer.shop')}</Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition-colors">{t('footer.cart')}</Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-white transition-colors">{t('footer.track')}</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact details */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.contactInfo')}</h3>
          <ul className="space-y-2 text-xs">
            {settings.storeAddress && (
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#1687FF] flex-shrink-0" />
                <span>{settings.storeAddress}</span>
              </li>
            )}
            {settings.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#1687FF] flex-shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition-colors">
                  {settings.contactPhone}
                </a>
              </li>
            )}
            {formattedWhatsApp && (
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#1687FF] flex-shrink-0" />
                <a href={formattedWhatsApp} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium text-[#1687FF]">
                  {t('footer.whatsapp')}
                </a>
              </li>
            )}
            {settings.emailAddress && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#1687FF] flex-shrink-0" />
                <a href={`mailto:${settings.emailAddress}`} className="hover:text-white transition-colors">
                  {settings.emailAddress}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Column 4: Follow Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.follow')}</h3>
          <div className="flex gap-3">
            {settings.facebookLink && (
              <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#1687FF] hover:text-white transition-all shadow-[0_0_15px_rgba(22,135,255,0)] hover:shadow-[0_0_15px_rgba(22,135,255,0.4)]">
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
            {settings.instagramLink && (
              <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#1687FF] hover:text-white transition-all shadow-[0_0_15px_rgba(22,135,255,0)] hover:shadow-[0_0_15px_rgba(22,135,255,0.4)]">
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {settings.tiktokLink && (
              <a href={settings.tiktokLink} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#1687FF] hover:text-white transition-all shadow-[0_0_15px_rgba(22,135,255,0)] hover:shadow-[0_0_15px_rgba(22,135,255,0.4)] font-bold text-xs">
                🎵
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-white/5 mt-8 pt-6 text-center text-[10px] text-slate-500">
        &copy; {new Date().getFullYear()} {settings.storeName}. {t('footer.rights')}
      </div>
    </footer>
  )
}
