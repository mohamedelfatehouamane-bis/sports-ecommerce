'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string
  long_description: string
  base_price: number
  sale_price: number | null
  image_url: string
  featured: boolean
  category_id: string
  categories: { id: string; name: string; slug: string }
  product_variants: Array<{
    id: string
    sku: string
    price: number
    cost: number
    quantity_in_stock: number
    reorder_level: number
    active: boolean
    size_id: string | null
    color_id: string | null
    material_id: string | null
    sizes: { id: string; name: string; display_order: number } | null
    colors: { id: string; name: string; hex_code: string; display_order: number } | null
    materials: { id: string; name: string; description: string; display_order: number } | null
  }>
  reviews: Array<{
    id: string
    rating: number
    title: string
    content: string
    verified_purchase: boolean
    created_at: string
    customers: { first_name: string; last_name: string }
  }>
}

interface ProductResponse {
  product: ProductDetail
  averageRating: number
  reviewCount: number
  verifiedPurchaseCount: number
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`)
        const data: ProductResponse = await response.json()
        setProduct(data.product)
        setAverageRating(data.averageRating)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.slug])

  useEffect(() => {
    if (!product) return

    // Find matching variant based on selected attributes
    const variant = product.product_variants.find((v) => {
      if (selectedSize && v.size_id !== selectedSize) return false
      if (selectedColor && v.color_id !== selectedColor) return false
      if (selectedMaterial && v.material_id !== selectedMaterial) return false
      return true
    })

    setSelectedVariant(variant?.id || null)
  }, [product, selectedSize, selectedColor, selectedMaterial])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Product not found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedVariantData = product.product_variants.find((v) => v.id === selectedVariant)
  const displayPrice = selectedVariantData?.price || product.sale_price || product.base_price
  const inStock = selectedVariantData?.quantity_in_stock ? selectedVariantData.quantity_in_stock > 0 : true

  // Get unique attribute values
  const sizes = Array.from(
    new Map(product.product_variants.filter((v) => v.sizes).map((v) => [v.size_id, v.sizes])).values()
  )
  const colors = Array.from(
    new Map(product.product_variants.filter((v) => v.colors).map((v) => [v.color_id, v.colors])).values()
  )
  const materials = Array.from(
    new Map(product.product_variants.filter((v) => v.materials).map((v) => [v.material_id, v.materials])).values()
  )

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-foreground">
            Sports Shop
          </Link>
          <div className="flex gap-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                Back to Products
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Image */}
          <div className="flex items-center justify-center rounded-lg border border-border bg-card">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover p-8"
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Link href={`/products?category=${product.categories.slug}`}>
                <span className="text-sm text-accent hover:underline">{product.categories.name}</span>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            {/* Rating */}
            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(averageRating) ? 'text-lg' : 'text-lg opacity-30'}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="border-t border-border pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">${displayPrice.toFixed(2)}</span>
                {product.sale_price && (
                  <span className="text-lg text-muted-foreground line-through">${product.base_price.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground">{product.description}</p>
              {product.long_description && (
                <p className="mt-4 text-sm text-muted-foreground">{product.long_description}</p>
              )}
            </div>

            {/* Variant Selection */}
            <div className="space-y-4 border-t border-border pt-4">
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Size</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size?.id}
                        onClick={() => setSelectedSize(size?.id || null)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          selectedSize === size?.id
                            ? 'bg-accent text-accent-foreground'
                            : 'border border-border bg-card text-foreground hover:border-accent'
                        }`}
                      >
                        {size?.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Color</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color?.id}
                        onClick={() => setSelectedColor(color?.id || null)}
                        className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                          selectedColor === color?.id
                            ? 'ring-2 ring-accent'
                            : 'border border-border hover:border-accent'
                        }`}
                      >
                        {color?.hex_code && (
                          <div
                            className="h-4 w-4 rounded-full border border-border"
                            style={{ backgroundColor: color.hex_code }}
                          />
                        )}
                        <span className="text-sm font-medium text-foreground">{color?.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {materials.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Material</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {materials.map((material) => (
                      <button
                        key={material?.id}
                        onClick={() => setSelectedMaterial(material?.id || null)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          selectedMaterial === material?.id
                            ? 'bg-accent text-accent-foreground'
                            : 'border border-border bg-card text-foreground hover:border-accent'
                        }`}
                      >
                        {material?.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stock Status */}
            {selectedVariantData && (
              <div className="rounded-md border border-border bg-card p-4">
                {inStock ? (
                  <p className="text-sm font-semibold text-green-600">
                    ✓ In Stock ({selectedVariantData.quantity_in_stock} available)
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-red-600">Out of Stock</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">SKU: {selectedVariantData.sku}</p>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <label className="block text-sm font-semibold text-foreground">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedVariantData?.quantity_in_stock || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-2 w-full rounded-md border border-border bg-card px-4 py-2 text-foreground"
                />
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!inStock || !selectedVariant}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
            <div className="mt-6 space-y-4">
              {product.reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{review.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        by {review.customers.first_name} {review.customers.last_name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-lg' : 'text-lg opacity-30'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                  {review.verified_purchase && (
                    <p className="mt-2 text-xs font-semibold text-green-600">✓ Verified Purchase</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
