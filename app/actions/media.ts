'use server'

import { requireAdmin } from '@/lib/admin-auth-helper'

/**
 * Server Action to upload an image file (mocked in prototype).
 * @param formData FormData containing the 'file' field.
 */
export async function uploadImageAction(formData: FormData) {
  try {
    await requireAdmin()
    const file = formData.get('file') as File | null
    if (!file) {
      throw new Error('No file provided')
    }

    return {
      success: true,
      url: '/logo.png', // Mock URL
      fileName: 'mock.png',
      message: 'Image uploaded successfully (mocked)',
    }
  } catch (error) {
    console.error('Upload error in Server Action:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

/**
 * Server Action to list all files (mocked in prototype).
 */
export async function listAllMedia() {
  try {
    await requireAdmin()
    return {
      success: true,
      media: [],
    }
  } catch (error) {
    console.error('List media error:', error)
    return {
      success: false,
      media: [],
      error: error instanceof Error ? error.message : 'Failed to retrieve media assets',
    }
  }
}

/**
 * Server Action to delete an asset (mocked in prototype).
 * @param fileName Name of the file inside the products bucket.
 */
export async function deleteMediaAction(fileName: string) {
  try {
    await requireAdmin()
    return {
      success: true,
      message: 'Asset deleted successfully from storage (mocked)',
    }
  } catch (error) {
    console.error('Delete media error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete asset',
    }
  }
}
