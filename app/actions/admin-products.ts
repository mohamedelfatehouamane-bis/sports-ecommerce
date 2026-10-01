'use server'

import * as db from '@/lib/data'
import { deleteMediaAction } from './media'
import { requireAdmin } from '@/lib/admin-auth-helper'

export interface UpsertProductInput {
  id?: string
  name: string
  description?: string | null
  price: number
  originalPrice?: number | null
  stock: number
  lowStockThreshold?: number
  categoryId?: string
  newCategoryName?: string
  isActive: boolean
  imageUrl?: string | null
  availableSizes?: string[]
  variants?: {
    id?: string
    size: string | null
    color: string | null
    quantity: number
  }[]
}

export async function upsertProduct(input: UpsertProductInput) {
  try {
    await requireAdmin()
    const result = await db.upsertProduct(input)

    return { success: true, product: result, message: input.id ? 'Product updated successfully' : 'Product created successfully', }
  } catch (error) {
    console.error('upsertProduct error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upsert product'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Delete a product (cascades to order items)
 */
export async function deleteProduct(productId: string) {
  try {
    await requireAdmin()
    
    const product = await db.deleteProduct(productId)
    if (product?.imageUrl) {
      try {
        const fileName = product.imageUrl.substring(product.imageUrl.lastIndexOf('/') + 1)
        await deleteMediaAction(fileName)
      } catch (err) {
        console.error('Failed to delete storage file on product delete:', product.imageUrl, err)
      }
    }

    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {

    const message = error instanceof Error ? error.message : 'Failed to delete product'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(productIds: string[]) {
  try {
    await requireAdmin()
    const deletedProducts = await db.deleteManyProducts(productIds)

    for (const product of deletedProducts) {
      if (product.imageUrl) {
        try {
          const fileName = product.imageUrl.substring(product.imageUrl.lastIndexOf('/') + 1)
          await deleteMediaAction(fileName)
        } catch (err) {
          console.error('Failed to delete storage file on bulk delete:', product.imageUrl, err)
        }
      }
    }
    return {
      success: true,
      message: 'Selected products deleted successfully',
    }
  } catch (error) {

    const message = error instanceof Error ? error.message : 'Failed to bulk delete products'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Bulk activate/deactivate products
 */
export async function bulkToggleProductsActive(productIds: string[], isActive: boolean) {
  try {
    await requireAdmin()
    await db.updateManyProducts(productIds, { isActive })
    return {
      success: true,
      message: `Selected products ${isActive ? 'activated' : 'deactivated'} successfully`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to bulk update products'
    return {
      success: false,
      error: message,
    }
  }
}

export async function getProducts() {
  try {
    await requireAdmin()
    const { products } = await db.getProducts({
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProduct(productId: string) {
  try {
    await requireAdmin()
    const product = await db.getProduct(productId, { variants: true })
    return product ? product : null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Lookup helper actions
 */
export async function getCategories() {
  try {
    await requireAdmin()
    const categories = await db.getCategories({
      orderBy: { name: 'asc' }
    })
    
    return categories.map(c => ({
      ...c,
      displayName: c.name
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

