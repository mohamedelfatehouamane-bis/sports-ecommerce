'use server'

import * as db from '@/lib/data'
import { requireAdmin } from '@/lib/admin-auth-helper'

export interface StoreSettingsInput {
  storeName: string
  storeLogo?: string | null
  storeDescription?: string | null
  contactPhone?: string | null
  whatsAppNumber?: string | null
  emailAddress?: string | null
  storeAddress?: string | null
  facebookLink?: string | null
  instagramLink?: string | null
  tiktokLink?: string | null
}

const DEFAULT_SETTINGS = {
  storeName: 'TG SPORT',
  storeLogo: '/logo.png',
  storeDescription: 'Your destination for premium sports equipment and apparel. Discover high-quality gear for your training.',
  contactPhone: '+1 234 567 890',
  whatsAppNumber: '+1 234 567 890',
  emailAddress: 'support@sportsshop.com',
  storeAddress: '123 Athletic Way, Sportsville',
  facebookLink: 'https://facebook.com/sportsshop',
  instagramLink: 'https://instagram.com/sportsshop',
  tiktokLink: 'https://tiktok.com/@sportsshop',
}

/**
 * Fetch the global store settings.
 * If it doesn't exist, create it with default seed data.
 */
export async function getStoreSettings() {
  try {
    const settings = await db.getStoreSettings()
    const settingsMap = new Map(settings.map(s => [s.settingKey, s.settingValue]))

    return {
      success: true,
      settings: {
        id: 'default',
        storeName: settingsMap.get('storeName') || DEFAULT_SETTINGS.storeName,
        storeLogo: settingsMap.get('storeLogo') || DEFAULT_SETTINGS.storeLogo,
        storeDescription: settingsMap.get('storeDescription') || DEFAULT_SETTINGS.storeDescription,
        contactPhone: settingsMap.get('contactPhone') || DEFAULT_SETTINGS.contactPhone,
        whatsAppNumber: settingsMap.get('whatsAppNumber') || DEFAULT_SETTINGS.whatsAppNumber,
        emailAddress: settingsMap.get('emailAddress') || DEFAULT_SETTINGS.emailAddress,
        storeAddress: settingsMap.get('storeAddress') || DEFAULT_SETTINGS.storeAddress,
        facebookLink: settingsMap.get('facebookLink') || DEFAULT_SETTINGS.facebookLink,
        instagramLink: settingsMap.get('instagramLink') || DEFAULT_SETTINGS.instagramLink,
        tiktokLink: settingsMap.get('tiktokLink') || DEFAULT_SETTINGS.tiktokLink,
      },
    }
  } catch (error) {
    console.error('Error fetching store settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch store settings',
      settings: {
        id: 'default',
        ...DEFAULT_SETTINGS,
      },
    }
  }
}

/**
 * Update the global store settings
 */
export async function updateStoreSettings(input: StoreSettingsInput) {
  try {
    await requireAdmin()
    const keys = Object.keys(input) as (keyof StoreSettingsInput)[]
    
    // Using transaction to update all settings
    for (const key of keys) {
      await db.updateStoreSetting(key, input[key] || '')
    }

    return {
      success: true,
      message: 'Store settings updated successfully',
      settings: {
        id: 'default',
        ...DEFAULT_SETTINGS,
        ...input
      },
    }
  } catch (error) {
    console.error('Error updating store settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update store settings',
    }
  }
}
