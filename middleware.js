import { NextResponse } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-access-secret-key-hyd-2026')

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Protected paths
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isClientRoute = pathname.startsWith('/client') && !pathname.startsWith('/client/login')

  if (!isAdminRoute && !isClientRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('accessToken')?.value

  if (!token) {
    const redirectUrl = isAdminRoute ? '/admin/login' : '/client/login'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)

    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (isClientRoute && payload.role !== 'client' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    const redirectUrl = isAdminRoute ? '/admin/login' : '/client/login'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*']
}
