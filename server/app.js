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
import { validateEnvironment } from './utils/envCheck.js'

// Execute Startup Environment Audit
validateEnvironment()

// Import routes
import authRoutes from './routes/auth.js'
import publicRoutes from './routes/public.js'
import clientRoutes from './routes/client.js'
import adminRoutes from './routes/admin.js'

// Import controllers
import { razorpayWebhook } from './controllers/paymentController.js'

// Import global error handler
import errorHandler from './middleware/error.js'

const app = express()

// Trust reverse proxy (Railway, Vercel, Cloudflare) for accurate client IP identification
app.set('trust proxy', 1)

// 1. SECURITY & LOGGING MIDDLEWARE

app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local uploaded images in front-end
}))
app.use(compression())

// CORS configuration (supports credentials for HttpOnly cookie exchange & all frontend domains)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://devhyd.com',
  'https://www.devhyd.com'
]

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (mobile apps, curl, server-to-server, Railway healthchecks)
    if (!origin) return callback(null, true)

    // 2. Allow localhost and 127.0.0.1 on any port (Vite dev server ports 5173, 5174, etc.)
    if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }

    // 3. Allow Vercel preview/production domains, Railway domains, and configured origins
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.railway.app') ||
      origin.includes('devhyd.com')
    ) {
      return callback(null, true)
    }

    // 4. In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }

    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cookie',
    'Set-Cookie'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// Redundant fallback header middleware to guarantee CORS headers on all responses (including errors)
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie')
    return res.sendStatus(200)
  }
  next()
})

app.use(morgan('dev'))
app.use(cookieParser())

// RAZORPAY WEBHOOK — must be registered BEFORE express.json() to capture raw body
app.post('/api/webhook/razorpay',
  express.raw({ type: '*/*' }),
  (req, res, next) => {
    req.rawBody = req.body.toString()
    try { req.body = JSON.parse(req.rawBody) } catch { req.body = {} }
    next()
  },
  razorpayWebhook
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 2. HEALTH CHECK ENDPOINTS (for Railway / Vercel Probes)
const healthHandler = async (req, res) => {
  let dbStatus = 'healthy'
  try {
    const prisma = (await import('./prisma.js')).default
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`
  }

  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    services: {
      database: dbStatus,
      n8nAutomation: process.env.N8N_WEBHOOK_URL ? 'configured' : 'disabled',
      whatsAppCloudApi: process.env.WHATSAPP_API_TOKEN ? 'configured' : 'disabled',
      emailSmtp: process.env.SMTP_USER ? 'configured' : 'disabled',
      storage: process.env.SUPABASE_URL ? 'supabase' : 'local'
    },
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
  limit: 1000, // Limit each client IP to 1000 requests per window
  skip: (req) => req.method === 'OPTIONS' || req.path === '/health' || req.path === '/api/health',
  message: { error: 'Too many requests, please try again after a few moments' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    const origin = req.headers.origin
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }
    res.status(options.statusCode).json(options.message)
  }
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
  console.log(`\n🚀 Dev.hyd Backend API running at port ${PORT}`)
  console.log(`🔒 Authentication API:  /api/auth`)
  console.log(`🌐 Public API:          /api/public`)
  console.log(`👤 Client Portal API:   /api/client`)
  console.log(`📊 Admin Dashboard API: /api/admin\n`)

  initDB().catch(err => {
    console.error('⚠️ DB Initialization warning:', err.message || err)
  })
})
