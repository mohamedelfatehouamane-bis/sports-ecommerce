import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/admin-auth-helper'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/a145')) {
    const sessionToken = request.cookies.get('admin_session')?.value
    const isValid = sessionToken ? await verifySessionToken(sessionToken) : false

    if (pathname === '/a145/login') {
      if (isValid) {
        return NextResponse.redirect(new URL('/a145', request.url))
      }
      return NextResponse.next()
    }

    if (!isValid) {
      return NextResponse.redirect(new URL('/a145/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/a145/:path*'],
}

