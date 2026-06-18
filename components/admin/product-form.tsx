'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { upsertProduct, type UpsertProductInput, type ProductVariantInput } from '@/app/actions/admin-products'
import { formatDZD } from '@/lib/utils/currency'

interface AdminProductFormProps {
  product?: any
  categories: any[]
  colors: any[]
  sizes: any[]
  onSuccess?: () => void
}

export function AdminProductForm({ product, categories, colors, sizes, onSuccess }: AdminProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: product?.name || '',
    description: product?.description || '',
    basePrice: product?.basePrice ? parseFloat(product.basePrice.toString()) : 0,
    categoryId: product?.categoryId || categories[0]?.id || '',
  })

  const [variants, setVariants] = useState<
    (ProductVariantInput & { tempId?: string; colorName?: string; sizeName?: string })[]
  >(
    product?.variants?.map((v: any) => ({
      id: v.id,
      colorId: v.colorId,
      sizeId: v.sizeId,
      stockCount: v.quantityInStock,
      priceOffset: parseFloat((v.price.toString() as any) - parseFloat(product.basePrice.toString())),
      tempId: Math.random().toString(),
      colorName: colors.find((c) => c.id === v.colorId)?.name,
      sizeName: sizes.find((s) => s.id === v.sizeId)?.name,
    })) || []
  )

  const [images, setImages] = useState<{ id?: string; url: string; colorLinked?: string | null }[]>(
    product?.images || []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'basePrice' ? parseFloat(value) || 0 : value,
    }))
  }

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        colorId: colors[0]?.id || '',
        sizeId: sizes[0]?.id || null,
        stockCount: 0,
        priceOffset: 0,
        tempId: Math.random().toString(),
      },
    ])
  }

  const updateVariant = (
    index: number,
    updates: Partial<ProductVariantInput & { colorName?: string; sizeName?: string }>
  ) => {
    setVariants((prev) => {
      const newVariants = [...prev]
      newVariants[index] = {
        ...newVariants[index],
        ...updates,
      }
      return newVariants
    })
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const addImage = () => {
    setImages((prev) => [...prev, { url: '', colorLinked: null }])
  }

  const updateImage = (index: number, updates: Partial<{ url: string; colorLinked: string | null }>) => {
    setImages((prev) => {
      const newImages = [...prev]
      newImages[index] = { ...newImages[index], ...updates }
      return newImages
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.title.trim()) {
        throw new Error('Product title is required')
      }
      if (variants.length === 0) {
        throw new Error('At least one variant is required')
      }

      const payload: UpsertProductInput = {
        id: product?.id,
        title: formData.title,
        description: formData.description,
        basePrice: formData.basePrice,
        categoryId: formData.categoryId,
        variants: variants.map(({ tempId, colorName, sizeName, ...v }) => v),
        images: images.map(({ ...img }) => img),
      }

      const result = await upsertProduct(payload)

      if (!result.success) {
        throw new Error(result.error)
      }

      alert(result.message)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Product Title *</label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Pro Runner Elite"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Product description..."
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Price (DZD) *</label>
            <Input
              type="number"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Product Variants *</h2>
          <Button type="button" onClick={addVariant} variant="outline">
            + Add Variant
          </Button>
        </div>

        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={variant.tempId || index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Variant {index + 1}</span>
                <Button
                  type="button"
                  onClick={() => removeVariant(index)}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Color *</label>
                  <select
                    value={variant.colorId}
                    onChange={(e) => updateVariant(index, { colorId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Size (Optional)</label>
                  <select
                    value={variant.sizeId || ''}
                    onChange={(e) => updateVariant(index, { sizeId: e.target.value || null })}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Stock *</label>
                  <Input
                    type="number"
                    value={variant.stockCount}
                    onChange={(e) => updateVariant(index, { stockCount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium mb-1">Price Offset from Base (DZD)</label>
                <Input
                  type="number"
                  value={variant.priceOffset}
                  onChange={(e) => updateVariant(index, { priceOffset: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  className="text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Final price: {formatDZD(formData.basePrice + variant.priceOffset)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Product Images</h2>
          <Button type="button" onClick={addImage} variant="outline">
            + Add Image
          </Button>
        </div>

        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Image {index + 1}</span>
                <Button
                  type="button"
                  onClick={() => removeImage(index)}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Image URL *</label>
                  <Input
                    type="url"
                    value={image.url}
                    onChange={(e) => updateImage(index, { url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Linked Color (Optional)</label>
                  <select
                    value={image.colorLinked || ''}
                    onChange={(e) => updateImage(index, { colorLinked: e.target.value || null })}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No color link</option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {image.url && (
                <div className="mt-3">
                  <img src={image.url} alt={`Product ${index + 1}`} className="h-32 w-32 rounded object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
