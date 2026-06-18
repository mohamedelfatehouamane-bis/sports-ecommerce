'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  sale_price: number | null
  image_url: string
  featured: boolean
  category_id: string
  categories: { name: string; slug: string }
  product_variants: Array<{
    id: string
    sku: string
    price: number
    quantity_in_stock: number
  }>
}

interface PaginatedResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('sort', sortBy)
      params.append('page', page.toString())

      const response = await fetch(`/api/products?${params}`)
      const data: PaginatedResponse = await response.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Map(data.products.map((p) => [p.categories.slug, p.categories])).values()
      )
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, sortBy, page])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedCategory, sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const displayPrice = (product: Product) => {
    return product.sale_price ? product.sale_price : product.base_price
  }

  const inStock = (product: Product) => {
    return product.product_variants.some((v) => v.quantity_in_stock > 0)
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-foreground">
            Sports Shop
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-8 text-4xl font-bold text-foreground">Products</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-border bg-card px-4 py-2 text-foreground"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-border bg-card px-4 py-2 text-foreground"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute right-2 top-2 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-accent">
                        {product.name}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ${displayPrice(product).toFixed(2)}
                        </span>
                        {product.sale_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.base_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!inStock(product)}
                        variant={inStock(product) ? 'default' : 'outline'}
                      >
                        {inStock(product) ? 'View' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
