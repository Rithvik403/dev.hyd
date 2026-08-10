import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ admin: null, client: null, adminViewing: false })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ admin: user, client: null, adminViewing: false })
    }

    if (user.role === 'client') {
      return NextResponse.json({
        admin: user.admin || null,
        client: user,
        adminViewing: user.adminViewing || false
      })
    }

    return NextResponse.json({ admin: null, client: null, adminViewing: false })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 })
  }
}
