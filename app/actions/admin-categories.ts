'use server'

import * as db from '@/lib/data'
import { requireAdmin } from '@/lib/admin-auth-helper'

export interface UpsertCategoryInput {
  id?: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
}

/**
 * Fetches all categories
 */
export async function getCategoriesWithSubcategories() {
  try {
    await requireAdmin()
    return await db.getCategories({ include: { products: true } })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Atomic upsert operation for Category with unique slug checks
 */
export async function upsertCategory(input: UpsertCategoryInput) {
  try {
    await requireAdmin()
    const cleanSlug = input.slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/-+$/g, '')
      .replace(/^-+/g, '')

    // Validate slug uniqueness
    const existing = await db.getCategoryBySlug(cleanSlug)
    if (existing) {
      throw new Error(`Category with slug "${cleanSlug}" already exists`)
    }

    if (input.id) {
      const category = await db.updateCategory(input.id, {
        name: input.name,
        slug: cleanSlug,
        description: input.description,
        isActive: input.isActive,
      })
      return {
        success: true,
        category,
        message: 'Category updated successfully',
      }
    } else {
      const category = await db.createCategory({
        name: input.name,
        slug: cleanSlug,
        description: input.description,
        isActive: input.isActive,
      })
      return {
        success: true,
        category,
        message: 'Category created successfully',
      }
    }
  } catch (error) {
    console.error('Error in upsertCategory:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upsert category'
    }
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string) {
  try {
    await requireAdmin()
    await db.deleteCategory(categoryId)
    return {
      success: true,
      message: 'Category deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category'
    }
  }
}

/**
 * Bulk delete categories
 */
export async function bulkDeleteCategories(categoryIds: string[]) {
  try {
    await requireAdmin()
    await db.deleteManyCategories(categoryIds)

    return {
      success: true,
      message: 'Selected categories deleted successfully'
    }
  } catch (error) {
    console.error('Bulk delete categories error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk delete categories'
    }
  }
}

/**
 * Bulk activate/deactivate categories
 */
export async function bulkToggleCategoriesActive(categoryIds: string[], isActive: boolean) {
  try {
    await requireAdmin()
    await db.updateManyCategories(categoryIds, { isActive })

    return {
      success: true,
      message: `Selected categories ${isActive ? 'activated' : 'deactivated'} successfully`
    }
  } catch (error) {
    console.error('Bulk toggle categories active error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update categories'
    }
  }
}
