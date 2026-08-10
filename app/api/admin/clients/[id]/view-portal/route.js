import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser, signAccessToken, signRefreshToken } from '@/lib/auth'

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const payload = {
      id: client.id,
      email: client.email,
      name: client.name,
      role: 'client',
      adminViewing: true,
      admin: { id: user.id, email: user.email, name: user.name }
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const response = NextResponse.json({ success: true, client, token: accessToken, redirect: '/client/dashboard' })

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
