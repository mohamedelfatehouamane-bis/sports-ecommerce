'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Check Your Email</h1>
        <p className="mb-6 text-muted-foreground">
          We&apos;ve sent a confirmation link to your email. Please click it to verify your account and complete your signup.
        </p>

        <Link href="/auth/login">
          <Button className="w-full">Return to Login</Button>
        </Link>
      </div>
    </div>
  )
}
