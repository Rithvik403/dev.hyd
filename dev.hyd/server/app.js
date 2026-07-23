import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config({ path: path.join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import { initDB } from './db.js'

// Import routes
import authRoutes from './routes/auth.js'
import publicRoutes from './routes/public.js'
import clientRoutes from './routes/client.js'
import adminRoutes from './routes/admin.js'

// Import global error handler
import errorHandler from './middleware/error.js'

const app = express()

// 1. SECURITY & LOGGING MIDDLEWARE
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local uploaded images in front-end
}))
app.use(compression())

// CORS configuration (supports credentials for HttpOnly cookie exchange)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:3000'
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Railway healthchecks)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      return callback(null, true)
    }
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 2. HEALTH CHECK ENDPOINTS (for Railway / Vercel Probes)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  })
}
app.get('/health', healthHandler)
app.get('/api/health', healthHandler)

// 3. STATIC FILE SERVING FOR LOCAL FILE UPLOAD FALLBACK
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// 4. RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Limit each IP to 300 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: 'draft-7',
  legacyHeaders: false
})
app.use('/api', limiter)

// Root landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Dev.hyd API Server</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 2.5rem; background: #0f172a; color: #f8fafc; line-height: 1.6;">
        <h2 style="color: #38bdf8; margin-top: 0;">🚀 Dev.hyd Backend API Server is Running!</h2>
        <p>This server provides REST API endpoints under <code>/api</code>.</p>
        <div style="background: #1e293b; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border: 1px solid #334155;">
          <h4 style="margin-top:0; color: #a5f3fc;">🌐 Web Application UI</h4>
          <p style="margin-bottom:0;">To view the website, admin dashboard, or client portal, open the React app at:<br/>
             <a href="${clientUrl}" style="color: #38bdf8; font-weight: bold; font-size: 1.1rem;">${clientUrl}</a>
          </p>
        </div>
      </body>
    </html>
  `)
})

// 4. ROUTE MOUNTING
app.use('/api/auth', authRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/admin', adminRoutes)

// Fallback for missing api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'online',
    message: 'Dev.hyd API server is active. Please use specific API endpoints.',
    endpoints: {
      auth: '/api/auth',
      public: '/api/public',
      client: '/api/client',
      admin: '/api/admin'
    }
  })
})

// 5. GLOBAL ERROR HANDLER
app.use(errorHandler)

// Start Server
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`\n🚀 Dev.hyd Backend API running at http://localhost:${PORT}`)
  console.log(`🔒 Authentication API:  http://localhost:${PORT}/api/auth`)
  console.log(`🌐 Public API:          http://localhost:${PORT}/api/public`)
  console.log(`👤 Client Portal API:   http://localhost:${PORT}/api/client`)
  console.log(`📊 Admin Dashboard API: http://localhost:${PORT}/api/admin\n`)

  initDB().catch(err => {
    console.error('⚠️ DB Initialization warning:', err.message || err)
  })
})
