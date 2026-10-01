'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { upsertProduct, type UpsertProductInput } from '@/app/actions/admin-products'
import { uploadImageAction, deleteMediaAction } from '@/app/actions/media'
import { compressImage } from '@/lib/utils/image-compressor'
import { Upload, Trash2, Loader2 } from 'lucide-react'

interface AdminProductFormProps {
  product?: any
  categories: any[]
  colors?: any[]
  sizes?: any[]
  onSuccess?: () => void
}

export function AdminProductForm({ product, categories, onSuccess }: AdminProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: product?.name || '',
    description: product?.description || '',
    originalPrice: product?.originalPrice ? parseFloat(product.originalPrice.toString()) : '',
    price: product?.price ? parseFloat(product.price.toString()) : '',
    stock: product?.stock || 0,
    lowStockThreshold: product?.lowStockThreshold || 5,
    categoryId: product?.categoryId || categories[0]?.id || '',
    newCategoryName: '',
    isActive: product?.isActive !== undefined ? product.isActive : true,
    mainImageUrl: product?.imageUrl || '',
    variants: product?.variants || [] as any[]
  })
  
  const [variantInput, setVariantInput] = useState({ size: '', color: '', quantity: '' })

  const handleAddVariant = () => {
    const s = variantInput.size.trim() || null
    const c = variantInput.color.trim() || null
    const q = parseInt(variantInput.quantity)
    if (isNaN(q) || q < 0) {
      alert('Valid quantity is required')
      return
    }
    setFormData(prev => {
      // Prevent exact duplicates
      const exists = prev.variants.find((v: any) => v.size === s && v.color === c)
      if (exists) {
        alert('Variant already exists. Remove it first to update quantity.')
        return prev
      }
      return { ...prev, variants: [...prev.variants, { size: s, color: c, quantity: q }] }
    })
    setVariantInput({ size: '', color: '', quantity: '' })
  }
  
  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== index)
    }))
  }

  const [uploadingMain, setUploadingMain] = useState(false)
  const [dragActiveMain, setDragActiveMain] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (name === 'price' || name === 'originalPrice' || name === 'stock' || name === 'lowStockThreshold') 
          ? (value === '' ? '' : parseFloat(value)) 
          : value,
    }))
  }

  const handleMainDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveMain(true)
    else if (e.type === "dragleave") setDragActiveMain(false)
  }

  const handleMainDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActiveMain(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleMainImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // DEBUG: alert("File selected: " + e.target.files[0].name)
      await handleMainImageUpload(e.target.files[0])
    } else {
      // alert("No file found in event.")
    }
  }

  const handleMainImageUpload = async (file: File) => {
    setUploadingMain(true)
    try {
      const compressedBlob = await compressImage(file, 800, 800, 0.85)
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })
      const formUploadData = new FormData()
      formUploadData.append('file', compressedFile)

      const res = await uploadImageAction(formUploadData)
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, mainImageUrl: res.url as string }))
      } else {
        alert("Upload failed: " + res.error)
      }
    } catch (err) {
      console.error(err)
      alert("Error during upload: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setUploadingMain(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.categoryId) {
        alert('Please select a category for the product.')
        setLoading(false)
        return
      }
      
      if (formData.categoryId === 'NEW' && !formData.newCategoryName.trim()) {
        alert('Please enter a name for the new category.')
        setLoading(false)
        return
      }
      
      if (!formData.title.trim()) {
        throw new Error('Product title is required')
      }

      const payload: UpsertProductInput = {
        id: product?.id,
        name: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        originalPrice: Number(formData.originalPrice) || null,
        stock: Number(formData.stock) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold),
        categoryId: formData.categoryId,
        newCategoryName: formData.newCategoryName,
        isActive: formData.isActive,
        imageUrl: formData.mainImageUrl || null,
        variants: formData.variants,
      }

      const res = await upsertProduct(payload)
      if (res.success) {
        alert(res.message || 'Product saved successfully!')
        onSuccess?.()
      } else {
        throw new Error(res?.error ?? 'Failed to save product')
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'An error occurred during submission.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 text-slate-200">
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400">
          <p className="font-bold flex items-center gap-2">⚠️ Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-6 rounded-2xl border border-slate-850 bg-slate-900/10 p-6 shadow-xl">
        <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
          📢 Basic Info
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Product Title *</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Pro Runner Elite"
              required
              className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 text-sm focus:border-orange-500 outline-none h-10 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.displayName || cat.name}
                </option>
              ))}
              <option value="NEW">➕ Other (Create New)</option>
            </select>
          </div>
          
          {formData.categoryId === 'NEW' && (
            <div>
              <label className="block text-xs font-semibold text-orange-400 mb-1">New Category Name *</label>
              <Input
                type="text"
                name="newCategoryName"
                value={formData.newCategoryName}
                onChange={handleInputChange}
                placeholder="e.g., Supplements"
                required
                className="bg-slate-950 border-orange-500/50 text-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">السعر الأصلي (DZD)</label>
            <Input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleInputChange}
              placeholder="e.g., 5000"
              step="0.01"
              min="0"
              className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">سعر الخصم / السعر الحالي (DZD) *</label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 4000"
                step="0.01"
                min="0"
                required
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none font-mono flex-1"
              />
              {Number(formData.originalPrice) > 0 && Number(formData.price) > 0 && Number(formData.price) < Number(formData.originalPrice) && (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded whitespace-nowrap">
                  خصم {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}%
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Count *</label>
            <Input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              required
              className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0 focus:outline-none font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Product description..."
              rows={4}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-250 text-sm focus:border-orange-500 outline-none transition-colors"
            />
          </div>

          <div className="flex gap-6 items-center pt-2 md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleInputChange} 
                className="rounded border-slate-800 bg-slate-950 text-orange-600 focus:ring-0 cursor-pointer h-4.5 w-4.5"
              />
              <span className="text-xs font-semibold text-slate-350">Active / Published</span>
            </label>
          </div>
        </div>
      </div>

      {/* Product Variants */}
      <div className="space-y-6 rounded-2xl border border-slate-850 bg-slate-900/10 p-6 shadow-xl">
        <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
          📦 Product Variants / Inventory
        </h2>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Variants</label>
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Color</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {formData.variants.map((variant: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{variant.size || '-'}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{variant.color || '-'}</td>
                    <td className="px-4 py-3 font-mono text-orange-400">{variant.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => removeVariant(index)} className="text-rose-400 hover:text-rose-300 transition-colors p-1 rounded-md hover:bg-rose-500/10 inline-flex items-center">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {formData.variants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No variants defined. Product will use the global stock count above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex gap-3 items-end bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Size <span className="font-normal text-slate-500">(e.g. S, 40)</span></label>
              <Input
                type="text"
                value={variantInput.size}
                onChange={(e) => setVariantInput(prev => ({...prev, size: e.target.value}))}
                placeholder="Leave blank for none"
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Color <span className="font-normal text-slate-500">(e.g. Black, أسود)</span></label>
              <Input
                type="text"
                value={variantInput.color}
                onChange={(e) => setVariantInput(prev => ({...prev, color: e.target.value}))}
                placeholder="Leave blank for none"
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0"
              />
            </div>
            <div className="flex-[0.5]">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Qty *</label>
              <Input
                type="number"
                value={variantInput.quantity}
                onChange={(e) => setVariantInput(prev => ({...prev, quantity: e.target.value}))}
                placeholder="0"
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0 font-mono"
              />
            </div>
            <Button type="button" onClick={handleAddVariant} variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-bold px-6 h-10">
              Add Variant
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Upload */}
      <div className="space-y-4 rounded-2xl border border-slate-850 bg-slate-900/10 p-6 shadow-xl">
        <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
          🖼️ Main Cover Image
        </h2>

        <div 
          onDragEnter={handleMainDrag} 
          onDragOver={handleMainDrag} 
          onDragLeave={handleMainDrag} 
          onDrop={handleMainDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 bg-slate-950 text-center relative min-h-[160px] transition-all ${
            dragActiveMain ? 'border-orange-500 bg-orange-950/5' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          {formData.mainImageUrl ? (
            <div className="relative group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-2 max-w-sm">
              <img src={formData.mainImageUrl} alt="Main Cover Preview" className="h-32 w-auto object-contain rounded-lg mx-auto" />
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                <label htmlFor="replace-main-img" className="cursor-pointer text-xs font-bold text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-700 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Replace
                </label>
                <input id="replace-main-img" type="file" accept="image/*" onChange={handleMainFileSelect} onClick={(e) => { e.currentTarget.value = '' }} className="sr-only" />
                <Button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, mainImageUrl: '' }))}
                  variant="ghost" 
                  className="text-xs font-bold text-rose-400 bg-slate-800 hover:bg-rose-950/30 hover:text-rose-300 border border-slate-750 px-3 h-8.5 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-slate-500">
              <Upload className="h-8 w-8 mx-auto text-slate-650" />
              <div className="text-xs font-semibold text-slate-450">
                Drag and drop your main product image here, or{' '}
                <label htmlFor="upload-main-img" className="text-orange-500 hover:underline cursor-pointer font-bold">
                  browse files
                </label>
                <input id="upload-main-img" type="file" accept="image/*" onChange={handleMainFileSelect} onClick={(e) => { e.currentTarget.value = '' }} className="sr-only" />
              </div>
            </div>
          )}

          {uploadingMain && (
            <div className="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center gap-2 text-orange-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xs text-slate-400">Uploading & compressing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-8 rounded-xl"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Saving...
            </span>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
}
