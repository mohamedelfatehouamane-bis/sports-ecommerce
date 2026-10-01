'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import Link from 'next/link'

export type ToastType = 'success' | 'error'

interface ToastData {
  id: number
  message: string
  type: ToastType
  action?: {
    label: string
    href: string
  }
}

let toastId = 0

export const showToast = (message: string, type: ToastType = 'success', action?: { label: string; href: string }) => {
  window.dispatchEvent(
    new CustomEvent('show-toast', {
      detail: { id: ++toastId, message, type, action },
    })
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: number) => void }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMounted(true)
      })
    })

    const timer = setTimeout(() => {
      handleClose()
    }, 4000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  const getStyles = (): React.CSSProperties => {
    if (isExiting) {
      return {
        opacity: 0,
        transform: 'translateY(-6px)',
        transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      }
    }
    if (isMounted) {
      return {
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1), transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
      }
    }
    return {
      opacity: 0,
      transform: 'translateY(-12px)',
      transition: 'none',
    }
  }

  return (
    <div
      style={getStyles()}
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-2xl border shadow-xl backdrop-blur-md ${
        toast.type === 'success'
          ? 'bg-[#020817]/90 border-emerald-500/30 shadow-[0_4px_30px_rgba(16,185,129,0.15)] text-emerald-50'
          : 'bg-[#020817]/90 border-rose-500/30 shadow-[0_4px_30px_rgba(244,63,94,0.15)] text-rose-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {toast.type === 'success' ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-sm font-bold">{toast.message}</p>
          {toast.action && (
            <Link
              href={toast.action.href}
              onClick={handleClose}
              className={`text-xs font-bold mt-0.5 underline-offset-4 hover:underline ${
                toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {toast.action.label}
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const handleShow = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>
      setToasts((prev) => [...prev, customEvent.detail])
    }

    window.addEventListener('show-toast', handleShow)
    return () => window.removeEventListener('show-toast', handleShow)
  }, [])

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}
