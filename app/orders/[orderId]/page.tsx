'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderDetailPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/track-order')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <p className="text-muted-foreground text-sm">جاري التوجيه إلى تتبع الطلب...</p>
    </div>
  )
}
