'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, Search, Trash2, Edit, Eye, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, Check, X, ShieldAlert,
  Loader2, RefreshCw
} from 'lucide-react'
import { 
  deleteProduct, 
  bulkDeleteProducts, 
  bulkToggleProductsActive,
  getProducts
} from '@/app/actions/admin-products'
import { formatDZD } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  price: number
  featured?: boolean
  isActive: boolean
  createdAt: string
  category: { name: string; id: string } | null
  stock: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all') // all, active, inactive
  const [selectedStock, setSelectedStock] = useState('all') // all, instock, lowstock, outofstock
  const [sortBy, setSortBy] = useState('newest') // newest, name-asc, name-desc, price-low, price-high

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Bulk Action States
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Modal Confirmation States
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const prodList = await getProducts()
      setProducts(prodList as unknown as Product[])
      
      const catNames = Array.from(new Set((prodList as unknown as Product[]).map((p) => p.category?.name).filter(Boolean)))
      setCategories(catNames as string[])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      showNotification('error', 'Failed to load products from database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Handle single delete
  const handleDeleteProduct = async (id: string) => {
    setIsActionLoading(true)
    try {
      const res = await deleteProduct(id)
      if (res.success) {
        showNotification('success', res.message || 'Product deleted successfully.')
        setProducts(products.filter((p) => p.id !== id))
        setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
      } else {
        showNotification('error', res.error || 'Failed to delete product.')
      }
    } catch (error) {
      showNotification('error', 'Error deleting product.')
    } finally {
      setIsActionLoading(false)
      setDeleteId(null)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setIsActionLoading(true)
    try {
      const res = await bulkDeleteProducts(selectedIds)
      if (res.success) {
        showNotification('success', res.message || 'Selected products deleted successfully.')
        setProducts(products.filter((p) => !selectedIds.includes(p.id)))
        setSelectedIds([])
      } else {
        showNotification('error', res.error || 'Failed to bulk delete products.')
      }
    } catch (error) {
      showNotification('error', 'Error deleting selected products.')
    } finally {
      setIsActionLoading(false)
      setIsBulkDeleting(false)
    }
  }

  // Handle bulk status change
  const handleBulkStatusChange = async (isActive: boolean) => {
    setIsActionLoading(true)
    try {
      const res = await bulkToggleProductsActive(selectedIds, isActive)
      if (res.success) {
        showNotification('success', res.message || 'Status updated successfully.')
        setProducts(
          products.map((p) =>
            selectedIds.includes(p.id) ? { ...p, isActive } : p
          )
        )
        setSelectedIds([])
      } else {
        showNotification('error', res.error || 'Failed to update status.')
      }
    } catch (error) {
      showNotification('error', 'Error updating status for selected products.')
    } finally {
      setIsActionLoading(false)
    }
  }

  // Row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageProductIds = paginatedProducts.map((p) => p.id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageProductIds])))
    } else {
      const pageProductIds = paginatedProducts.map((p) => p.id)
      setSelectedIds(selectedIds.filter((id) => !pageProductIds.includes(id)))
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const prodCat = p.category?.name
    const matchesCategory = selectedCategory === 'all' || prodCat === selectedCategory
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'active' && p.isActive) || 
      (selectedStatus === 'inactive' && !p.isActive)

    const stock = p.stock
    const matchesStock = 
      selectedStock === 'all' ||
      (selectedStock === 'instock' && stock > 10) ||
      (selectedStock === 'lowstock' && stock > 0 && stock <= 10) ||
      (selectedStock === 'outofstock' && stock === 0)

    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name)
    }
    if (sortBy === 'price-low') {
      return a.price - b.price
    }
    if (sortBy === 'price-high') {
      return b.price - a.price
    }
    return 0
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedStatus, selectedStock, sortBy])

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-600/30">S</div>
            <span className="text-lg font-bold tracking-wider uppercase text-orange-500">Sports Shop Admin</span>
          </div>
          <Link href="/a145">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 transform translate-y-0 border animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/90 border-rose-800 text-rose-300'
          }`}>
            {notification.type === 'success' ? <Check className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Product Catalog</h1>
            <p className="mt-1 text-sm text-slate-400">Add, edit, or manage products, inventory and statuses.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={fetchProducts} 
              disabled={loading}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
            <Link href="/a145/products/new">
              <Button className="bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-950 border-slate-800 focus-visible:ring-orange-600 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-orange-600 outline-none w-full"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-orange-600 outline-none w-full"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Stock Filter */}
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-orange-600 outline-none w-full"
              >
                <option value="all">All Stock Levels</option>
                <option value="instock">In Stock (&gt;10)</option>
                <option value="lowstock">Low Stock (1-10)</option>
                <option value="outofstock">Out of Stock</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-orange-600 outline-none w-full"
              >
                <option value="newest">Newest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-low">Price (Low-High)</option>
                <option value="price-high">Price (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-orange-950/20 border border-orange-900/30 px-4 py-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-orange-600 text-white rounded-full px-2 py-0.5">{selectedIds.length}</span>
                <span className="text-sm text-orange-200">products selected</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleBulkStatusChange(true)} 
                  disabled={isActionLoading}
                  className="bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-slate-800"
                >
                  Activate
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleBulkStatusChange(false)} 
                  disabled={isActionLoading}
                  className="bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
                >
                  Deactivate
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setIsBulkDeleting(true)} 
                  disabled={isActionLoading}
                  className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Catalog Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-800 bg-slate-900/10">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading products catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-800 bg-slate-900/10 text-center px-4">
            <Filter className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No products found</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">Try tweaking your search term, filters, or create a new product catalog entry.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-sm shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-800 accent-orange-600 cursor-pointer h-4 w-4 bg-slate-950"
                      />
                    </th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Inventory</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {paginatedProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id)
                    const stock = product.stock
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`hover:bg-slate-900/40 transition-colors text-sm text-slate-300 ${
                          isSelected ? 'bg-orange-950/5 hover:bg-orange-950/10' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(product.id, e.target.checked)}
                            className="rounded border-slate-800 accent-orange-600 cursor-pointer h-4 w-4 bg-slate-950"
                          />
                        </td>

                        {/* Product Meta Column */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white truncate max-w-xs">{product.name}</span>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            {product.category?.name || 'Unassigned'}
                          </span>
                        </td>

                        {/* Price Column */}
                        <td className="px-6 py-4 font-mono font-medium text-white">
                          <span>{formatDZD(product.price)}</span>
                        </td>

                        {/* Stock Quantity Column */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                              stock > 10
                                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                                : stock > 0
                                ? 'bg-amber-950/30 border-amber-800 text-amber-400'
                                : 'bg-rose-950/30 border-rose-800 text-rose-400'
                            }`}
                          >
                            {stock === 0 ? 'Out of Stock' : `${stock} Units`}
                          </span>
                        </td>

                        {/* Status badging Column */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {product.isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 border border-emerald-850 px-2 py-0.5 text-xs text-emerald-400">
                                <Check className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-xs text-slate-400">
                                <X className="h-3 w-3" /> Inactive
                              </span>
                            )}
                            {product.featured && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-950/50 border border-amber-850 px-2 py-0.5 text-xs text-amber-400">
                                ★ Featured
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <Link href={`/a145/products/${product.id}/edit`}>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setDeleteId(product.id)}
                              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-slate-800 bg-slate-900/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-200">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-slate-200">
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-200">{filteredProducts.length}</span> products
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    variant={currentPage === idx + 1 ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 text-xs ${
                      currentPage === idx + 1 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Single Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <ShieldAlert className="h-8 w-8" />
              <h3 className="text-xl font-bold">Delete Product?</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete this product? This action will permanently remove the product and all associated information. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={isActionLoading}
                className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteId && handleDeleteProduct(deleteId)}
                disabled={isActionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
              >
                {isActionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-100">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <ShieldAlert className="h-8 w-8" />
              <h3 className="text-xl font-bold">Bulk Delete Products?</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">{selectedIds.length}</span> selected products? This will permanently remove them from the database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsBulkDeleting(false)}
                disabled={isActionLoading}
                className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={isActionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
              >
                {isActionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Yes, Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
