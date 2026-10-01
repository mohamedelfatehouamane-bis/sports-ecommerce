'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { uploadImageAction, listAllMedia, deleteMediaAction } from '@/app/actions/media'
import { compressImage } from '@/lib/utils/image-compressor'
import { 
  ArrowLeft, Loader2, Upload, Trash2, Copy, Check, Image as ImageIcon, ExternalLink, RefreshCw
} from 'lucide-react'

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await listAllMedia()
      if (res.success) {
        setMedia(res.media || [])
      } else {
        showNotification('error', res.error || 'Failed to retrieve media assets.')
      }
    } catch (error) {
      showNotification('error', 'Error listing assets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    showNotification('success', 'URL copied to clipboard!')
    setTimeout(() => setCopiedUrl(null), 2500)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let uploadCount = 0
    let failCount = 0

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Compress on client side before upload
        const compressedBlob = await compressImage(file, 1200, 1200, 0.8)
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })

        const formData = new FormData()
        formData.append('file', compressedFile)

        const res = await uploadImageAction(formData)
        if (res.success) {
          uploadCount++
        } else {
          failCount++
        }
      }

      if (uploadCount > 0) {
        showNotification('success', `Uploaded ${uploadCount} images successfully!`)
        fetchMedia()
      }
      if (failCount > 0) {
        showNotification('error', `Failed to upload ${failCount} images.`)
      }
    } catch (err) {
      showNotification('error', 'Error occurred during image upload process.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (name: string) => {
    setDeletingName(name)
    try {
      const res = await deleteMediaAction(name)
      if (res.success) {
        showNotification('success', 'Asset deleted successfully.')
        setMedia(prev => prev.filter(m => m.name !== name))
      } else {
        showNotification('error', res.error || 'Failed to delete asset.')
      }
    } catch (error) {
      showNotification('error', 'Error deleting asset.')
    } finally {
      setDeletingName(null)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/a145" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-white">Media Manager</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchMedia} disabled={loading} className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-805">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/a145">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-805">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 border ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/90 border-rose-800 text-rose-300'
          }`}>
            <ImageIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        )}

        {/* Action Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-850 pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Media Assets Storage</h2>
            <p className="text-xs text-slate-400 mt-1">Directly browse, upload, copy links or delete files inside the products storage bucket.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 px-6 rounded-lg shadow-lg shadow-orange-600/20 flex items-center gap-2 justify-center transition-colors">
              {uploading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Upload className="h-4.5 w-4.5" />}
              <span>Upload Media Files</span>
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 border border-slate-800 bg-slate-900/10 rounded-2xl">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Listing media files...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-slate-800 bg-slate-900/10 rounded-2xl text-center px-4">
            <ImageIcon className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="font-bold text-slate-300 text-base">No media assets found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload images to get started. They will be saved to the local prototype storage.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {media.map((file) => {
              const isCopied = copiedUrl === file.url
              const isDeleting = deletingName === file.name

              return (
                <div key={file.id} className="rounded-xl border border-slate-850 bg-slate-900/20 overflow-hidden group shadow-lg flex flex-col hover:border-slate-800 transition-colors">
                  <div className="aspect-square bg-slate-950 p-2 flex items-center justify-center overflow-hidden relative">
                    <img src={file.url} alt={file.name} className="h-full w-full object-contain max-h-[160px] rounded-lg" />
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleCopyUrl(file.url)} className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                        {isCopied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5" />}
                      </Button>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-4.5 w-4.5" />
                      </a>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(file.name)} disabled={isDeleting} className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4.5 w-4.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/40 border-t border-slate-850 flex-1 min-w-0">
                    <p className="text-[10px] text-slate-300 font-semibold font-mono truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1 font-medium">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
