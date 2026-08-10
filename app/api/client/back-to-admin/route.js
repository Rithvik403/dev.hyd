import { NextResponse } from 'next/server'
import { getCurrentUser, signAccessToken, signRefreshToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || !user.adminViewing || !user.admin) {
      return NextResponse.json({ error: 'Not currently in admin emulation mode' }, { status: 400 })
    }

    const payload = {
      id: user.admin.id,
      email: user.admin.email,
      name: user.admin.name,
      role: 'admin'
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const response = NextResponse.json({ success: true, redirect: '/admin' })

    const isProd = process.env.NODE_ENV === 'production'
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60
    })
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
