import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-access-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'

// Helper to sign tokens
export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

// Clear cookies helper
export function clearAuthCookies(res) {
  res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })
}

// Authentication middleware
export async function requireAuth(req, res, next) {
  let accessToken = req.cookies?.accessToken
  let refreshToken = req.cookies?.refreshToken

  // Fallback to Bearer token in Authorization header
  if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    accessToken = req.headers.authorization.split(' ')[1]
  }

  // 1. Try to verify Access Token
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET)
      req.user = decoded
      
      // Populate req.session for legacy compatibility
      req.session = req.session || {}
      if (decoded.role === 'admin') {
        req.session.admin = { id: decoded.id, email: decoded.email, name: decoded.name }
      } else if (decoded.role === 'client') {
        req.session.client = { id: decoded.id, email: decoded.email, name: decoded.name }
        req.session.adminViewing = decoded.adminViewing || false
        if (decoded.admin) {
          req.session.admin = decoded.admin
        }
      }
      return next()
    } catch (err) {
      // Access token is invalid or expired, continue to refresh token check
      console.log('Access token expired or invalid, attempting refresh...')
    }
  }

  // 2. Try to refresh using Refresh Token
  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
      
      // Fetch user to ensure they still exist
      let userObj = null
      if (decodedRefresh.role === 'admin') {
        userObj = await prisma.admin.findUnique({ where: { id: decodedRefresh.id } })
      } else if (decodedRefresh.role === 'client') {
        userObj = await prisma.client.findUnique({ where: { id: decodedRefresh.id } })
      }

      if (!userObj) {
        clearAuthCookies(res)
        return res.status(401).json({ error: 'User does not exist' })
      }

      // Generate new access token
      const newPayload = {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name,
        role: decodedRefresh.role,
        adminViewing: decodedRefresh.adminViewing || false,
        admin: decodedRefresh.admin || null
      }

      const newAccessToken = signAccessToken(newPayload)

      // Set new access token cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
      })

      req.user = newPayload
      req.session = req.session || {}
      if (newPayload.role === 'admin') {
        req.session.admin = { id: newPayload.id, email: newPayload.email, name: newPayload.name }
      } else if (newPayload.role === 'client') {
        req.session.client = { id: newPayload.id, email: newPayload.email, name: newPayload.name }
        req.session.adminViewing = newPayload.adminViewing
        if (newPayload.admin) {
          req.session.admin = newPayload.admin
        }
      }

      return next()
    } catch (err) {
      clearAuthCookies(res)
      return res.status(401).json({ error: 'Session expired, please login again' })
    }
  }

  // No tokens found
  return res.status(401).json({ error: 'Unauthorized: Authentication required' })
}

// Optional authentication - attaches req.user if valid tokens are present,
// but never blocks the request (used by GET /api/auth/me so anonymous
// visitors get a clean { admin: null, client: null } instead of a 401)
export async function attachUserIfPresent(req, res, next) {
  let accessToken = req.cookies?.accessToken
  let refreshToken = req.cookies?.refreshToken

  // Fallback to Bearer token in Authorization header
  if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    accessToken = req.headers.authorization.split(' ')[1]
  }

  if (accessToken) {
    try {
      req.user = jwt.verify(accessToken, JWT_SECRET)
      return next()
    } catch (err) {
      // fall through to refresh token check
    }
  }

  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
      let userObj = null
      if (decodedRefresh.role === 'admin') {
        userObj = await prisma.admin.findUnique({ where: { id: decodedRefresh.id } })
      } else if (decodedRefresh.role === 'client') {
        userObj = await prisma.client.findUnique({ where: { id: decodedRefresh.id } })
      }

      if (userObj) {
        const newPayload = {
          id: userObj.id,
          email: userObj.email,
          name: userObj.name,
          role: decodedRefresh.role,
          adminViewing: decodedRefresh.adminViewing || false,
          admin: decodedRefresh.admin || null
        }
        const newAccessToken = signAccessToken(newPayload)
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        })
        req.user = newPayload
      }
    } catch (err) {
      // invalid/expired refresh token - just proceed as anonymous
    }
  }

  return next()
}

// Role specific middlewares
export function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      return next()
    }
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  })
}

export function requireClient(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user && req.user.role === 'client') {
      return next()
    }
    return res.status(403).json({ error: 'Forbidden: Client access required' })
  })
}
