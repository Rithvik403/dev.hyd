import express from 'express'
import {
  adminLogin,
  clientLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  sendEmailVerification,
  verifyEmail
} from '../controllers/authController.js'
import { requireClient, requireAuth, attachUserIfPresent } from '../middleware/auth.js'
import { validateLogin } from '../middleware/validation.js'

const router = express.Router()

router.post('/login/admin', validateLogin, adminLogin)
router.post('/login/client', validateLogin, clientLogin)
router.post('/logout', logout)
router.get('/me', attachUserIfPresent, getMe) // Never 401s; returns { admin: null, client: null } if not logged in
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/verify-email', verifyEmail)
router.post('/send-verification', requireClient, sendEmailVerification)

export default router
