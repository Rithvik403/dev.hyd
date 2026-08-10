import express from 'express'
import { rateLimit } from 'express-rate-limit'
import {
  getHomeData,
  getBlogPosts,
  getBlogPostBySlug,
  submitContactForm,
  trackProject
} from '../controllers/publicController.js'
import {
  createOrder,
  verifyPayment,
  getProjectPayments
} from '../controllers/paymentController.js'
import { validateContact } from '../middleware/validation.js'

const router = express.Router()

// Strict rate limiters for public endpoints
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit to 5 submissions per IP
  message: { error: 'Too many lead submissions from this IP. Please try again after 15 minutes.' }
})

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many payment creation attempts. Please try again shortly.' }
})

router.get('/home', getHomeData)
router.get('/blog', getBlogPosts)
router.get('/blog/:slug', getBlogPostBySlug)
router.post('/contact', contactFormLimiter, validateContact, submitContactForm)
router.get('/track/:id', trackProject)

// Public payment endpoints (no auth — UUID provides security)
router.post('/payments/create-order', paymentLimiter, createOrder)
router.post('/payments/verify', paymentLimiter, verifyPayment)
router.get('/payments/:projectId', getProjectPayments)

export default router
