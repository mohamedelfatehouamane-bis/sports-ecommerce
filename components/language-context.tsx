'use client'

import React, { createContext, useContext } from 'react'
import { ar } from '@/lib/locales/ar'

type Language = 'ar'

interface LanguageContextType {
  language: Language
  t: (keyPath: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  ar,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Removed useEffects and state as language is fixed to 'ar'

  // Translation helper function using dot notation (e.g. t('header.shop'))
  const t = (keyPath: string): string => {
    const keys = keyPath.split('.')
    let current: any = translations.ar

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return keyPath
      }
    }

    return typeof current === 'string' ? current : keyPath
  }

  return (
    <LanguageContext.Provider value={{ language: 'ar', t }}>
      <div className="">
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
