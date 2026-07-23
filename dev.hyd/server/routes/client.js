import express from 'express'
import {
  getClientDashboard,
  getClientProjectDetail,
  sendMessage,
  getMessages,
  uploadClientFile,
  updateProfile,
  markNotificationsRead,
  backToAdmin
} from '../controllers/clientController.js'
import { requireClient, requireAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Back to admin is accessed from client session, so requireAuth is sufficient (no client restriction since it rolls back to admin)
router.post('/back-to-admin', requireAuth, backToAdmin)

// Client specific protected endpoints
router.get('/dashboard', requireClient, getClientDashboard)
router.get('/project/:id', requireClient, getClientProjectDetail)
router.post('/project/:id/upload', requireClient, upload.single('file'), uploadClientFile)
router.post('/messages', requireClient, sendMessage)
router.get('/messages', requireClient, getMessages)
router.post('/profile', requireClient, updateProfile)
router.post('/notifications/read', requireClient, markNotificationsRead)

export default router
