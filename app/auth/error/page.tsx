'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An error occurred during authentication'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Authentication Error</h1>
        <p className="mb-6 text-muted-foreground">
          {message}
        </p>

        <Link href="/auth/login">
          <Button className="w-full">Try Again</Button>
        </Link>
      </div>
    </div>
  )
}

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Authentication Error</h1>
        <p className="mb-6 text-muted-foreground">
          Loading error details...
        </p>

        <Link href="/auth/login">
          <Button className="w-full">Try Again</Button>
        </Link>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorFallback />}>
      <ErrorContent />
    </Suspense>
  )
}
