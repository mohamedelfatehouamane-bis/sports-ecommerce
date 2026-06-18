import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold text-foreground">Sports Shop</h1>
          <div className="flex gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Welcome to Sports Shop
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Your destination for premium sports equipment and apparel
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-up">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-4xl">🏃</div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Premium Quality</h3>
            <p className="text-muted-foreground">
              Handpicked sports equipment from the world&apos;s leading brands
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-4xl">🚚</div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Fast Delivery</h3>
            <p className="text-muted-foreground">
              Quick and reliable shipping to your doorstep
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-4xl">💯</div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Guaranteed Satisfaction</h3>
            <p className="text-muted-foreground">
              Full refund guarantee if you&apos;re not completely satisfied
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
