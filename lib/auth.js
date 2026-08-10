import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from './prisma.js'

const isProd = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-access-secret-key-hyd-2026'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-hyd-2026'

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch {
    return null
  }
}

export async function getCurrentUser(request) {
  let token = null

  // 1. Check Authorization header
  if (request?.headers) {
    const authHeader = request.headers.get?.('authorization') || request.headers['authorization']
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  // 2. Check Next.js cookies
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('accessToken')?.value
    } catch {
      // ignore
    }
  }

  if (token) {
    const decoded = verifyAccessToken(token)
    if (decoded) return decoded
  }

  // 3. Try refresh token
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value
    if (refreshToken) {
      const decodedRefresh = verifyRefreshToken(refreshToken)
      if (decodedRefresh) {
        let user = null
        if (decodedRefresh.role === 'admin') {
          user = await prisma.admin.findUnique({ where: { id: decodedRefresh.id } })
        } else if (decodedRefresh.role === 'client') {
          user = await prisma.client.findUnique({ where: { id: decodedRefresh.id } })
        }
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: decodedRefresh.role,
            adminViewing: decodedRefresh.adminViewing || false,
            admin: decodedRefresh.admin || null
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return null
}
