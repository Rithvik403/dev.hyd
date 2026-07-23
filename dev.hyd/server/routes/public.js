import express from 'express'
import {
  getHomeData,
  getBlogPosts,
  getBlogPostBySlug,
  submitContactForm,
  trackProject
} from '../controllers/publicController.js'
import { validateContact } from '../middleware/validation.js'

const router = express.Router()

router.get('/home', getHomeData)
router.get('/blog', getBlogPosts)
router.get('/blog/:slug', getBlogPostBySlug)
router.post('/contact', validateContact, submitContactForm)
router.get('/track/:id', trackProject)

export default router
