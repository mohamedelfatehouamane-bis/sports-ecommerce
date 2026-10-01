'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AdminProductForm } from '@/components/admin/product-form'
import { getCategories } from '@/app/actions/admin-products'
import { Loader2, ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const catsRes = await getCategories()
        setCategories(catsRes)
      } catch (error) {
        console.error('Failed to load form lookups:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLookups()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading attributes data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-600/30">S</div>
            <span className="text-lg font-bold tracking-wider uppercase text-orange-500">Sports Shop Admin</span>
          </div>
          <Link href="/a145/products">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Catalog
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Add New Product</h1>
          <p className="mt-1 text-sm text-slate-400">Add catalog products, set color-grouped images, select attributes, and customize variants.</p>
        </div>

        <AdminProductForm
          categories={categories}
          onSuccess={() => router.push('/a145/products')}
        />
      </div>
    </div>
  )
}
