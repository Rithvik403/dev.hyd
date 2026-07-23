import express from 'express'
import {
  getDashboardData,
  emulateClient,
  updateEnquiryStatus,
  deleteEnquiry,
  createClient,
  updateClient,
  deleteClient,
  createProject,
  updateProject,
  addProjectTimelineUpdate,
  uploadProjectFile,
  deleteProject,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getServices,
  createService,
  updateService,
  deleteService,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getSettings,
  updateSettings
} from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { validateClient, validateBlogPost } from '../middleware/validation.js'

const router = express.Router()

// Apply requireAdmin to all routes in this router
router.use(requireAdmin)

// Dashboard data
router.get('/dashboard', getDashboardData)

// Portal emulation
router.post('/clients/:id/view-portal', emulateClient)

// Enquiries
router.post('/enquiries/:id/status', updateEnquiryStatus)
router.delete('/enquiries/:id', deleteEnquiry)

// Clients
router.post('/clients', validateClient, createClient)
router.put('/clients/:id', updateClient)
router.delete('/clients/:id', deleteClient)

// Projects
router.post('/projects', createProject)
router.put('/projects/:id', updateProject)
router.post('/projects/:id/update', addProjectTimelineUpdate)
router.post('/projects/:id/upload', upload.single('file'), uploadProjectFile)
router.delete('/projects/:id', deleteProject)

// Blogs
router.post('/blog', upload.single('cover'), createBlogPost)
router.put('/blog/:id', upload.single('cover'), updateBlogPost)
router.delete('/blog/:id', deleteBlogPost)

// Services
router.get('/services', getServices)
router.post('/services', createService)
router.put('/services/:id', updateService)
router.delete('/services/:id', deleteService)

// Testimonials
router.get('/testimonials', getTestimonials)
router.post('/testimonials', upload.single('avatar'), createTestimonial)
router.put('/testimonials/:id', upload.single('avatar'), updateTestimonial)
router.delete('/testimonials/:id', deleteTestimonial)

// Gallery
router.get('/gallery', getGallery)
router.post('/gallery', upload.single('image'), createGalleryItem)
router.put('/gallery/:id', upload.single('image'), updateGalleryItem)
router.delete('/gallery/:id', deleteGalleryItem)

// FAQs
router.get('/faqs', getFAQs)
router.post('/faqs', createFAQ)
router.put('/faqs/:id', updateFAQ)
router.delete('/faqs/:id', deleteFAQ)

// Settings
router.get('/settings', getSettings)
router.put('/settings', updateSettings)

export default router
