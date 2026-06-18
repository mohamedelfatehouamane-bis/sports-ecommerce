'use server'

import { prisma } from '@/lib/db'

export interface ProductVariantInput {
  id?: string // For existing variants
  colorId: string
  sizeId?: string | null
  stockCount: number
  priceOffset: number // Price adjustment from base price
}

export interface ProductImageInput {
  id?: string // For existing images
  url: string
  colorLinked?: string | null // Color ID this image is linked to
}

export interface UpsertProductInput {
  id?: string // If provided, update; otherwise create
  title: string
  description: string
  basePrice: number
  categoryId: string
  variants: ProductVariantInput[]
  images: ProductImageInput[]
}

/**
 * Atomic upsert operation for products with nested variants and images
 * Uses Prisma $transaction to ensure consistency
 */
export async function upsertProduct(input: UpsertProductInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const slug = input.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      // Check if slug already exists (if creating new product)
      if (!input.id) {
        const existing = await tx.product.findUnique({
          where: { slug },
        })
        if (existing) {
          throw new Error(`Product with slug "${slug}" already exists`)
        }
      }

      if (input.id) {
        // UPDATE existing product
        // 1. Update base product
        const product = await tx.product.update({
          where: { id: input.id },
          data: {
            name: input.title,
            slug,
            description: input.description,
            basePrice: new Decimal(input.basePrice),
          },
        })

        // 2. Delete existing variants (to avoid orphans and duplicate SKUs)
        await tx.productVariant.deleteMany({
          where: { productId: input.id },
        })

        // 3. Create new variants
        if (input.variants.length > 0) {
          await tx.productVariant.createMany({
            data: input.variants.map((v) => ({
              productId: input.id,
              colorId: v.colorId,
              sizeId: v.sizeId || null,
              quantityInStock: v.stockCount,
              price: new Decimal(input.basePrice + v.priceOffset),
              sku: generateSKU(input.title, v.colorId, v.sizeId),
            })),
          })
        }

        return product
      } else {
        // CREATE new product
        // 1. Create product with nested variants
        const product = await tx.product.create({
          data: {
            name: input.title,
            slug,
            description: input.description,
            basePrice: new Decimal(input.basePrice),
            categoryId: input.categoryId,
            variants: {
              createMany: {
                data: input.variants.map((v) => ({
                  colorId: v.colorId,
                  sizeId: v.sizeId || null,
                  quantityInStock: v.stockCount,
                  price: new Decimal(input.basePrice + v.priceOffset),
                  sku: generateSKU(input.title, v.colorId, v.sizeId),
                })),
              },
            },
          },
          include: {
            variants: true,
          },
        })

        return product
      }
    })

    return {
      success: true,
      product: result,
      message: input.id ? 'Product updated successfully' : 'Product created successfully',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upsert product'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Generate a consistent SKU from product title, color, and size
 * Format: PROD-COLOR-SIZE (e.g., PRO-RUNNER-BLK-M)
 */
function generateSKU(title: string, colorId: string, sizeId?: string | null): string {
  const titlePart = title
    .split(' ')
    .map((w) => w.substring(0, 2).toUpperCase())
    .join('')
    .substring(0, 6)

  const colorPart = colorId.substring(0, 3).toUpperCase()
  const sizePart = sizeId ? sizeId.substring(0, 3).toUpperCase() : 'STD'

  return `${titlePart}-${colorPart}-${sizePart}`.substring(0, 20)
}

/**
 * Delete a product (cascades to variants, images, cart items, order items)
 */
export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    })

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
