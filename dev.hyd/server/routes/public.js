import express from 'express'
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

router.get('/home', getHomeData)
router.get('/blog', getBlogPosts)
router.get('/blog/:slug', getBlogPostBySlug)
router.post('/contact', validateContact, submitContactForm)
router.get('/track/:id', trackProject)

// Public payment endpoints (no auth — UUID provides security)
router.post('/payments/create-order', createOrder)
router.post('/payments/verify', verifyPayment)
router.get('/payments/:projectId', getProjectPayments)

export default router
