import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'
import { signAccessToken, signRefreshToken, clearAuthCookies } from '../middleware/auth.js'
import nodemailer from 'nodemailer'

// SMTP Transporter setup helper
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Helper to send emails
async function sendAuthEmail(to, subject, html) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your@gmail.com') {
    console.log(`📧 SMTP not configured — would have sent email to ${to}: ${subject}`)
    return
  }
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Dev.hyd Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    })
    console.log(`📧 Email sent successfully to ${to}`)
  } catch (err) {
    console.error('📧 Nodemailer error:', err.message)
  }
}

// 1. ADMIN LOGIN
export async function adminLogin(req, res, next) {
  const { email, password } = req.body
  try {
    const cleanEmail = email.trim().toLowerCase()
    const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } })
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const payload = { id: admin.id, email: admin.email, name: admin.name, role: 'admin' }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 mins
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({ success: true, user: payload, token: accessToken })
  } catch (error) {
    next(error)
  }
}

// 2. CLIENT LOGIN
export async function clientLogin(req, res, next) {
  const { email, password } = req.body
  try {
    const cleanEmail = email.trim().toLowerCase()
    const client = await prisma.client.findUnique({ where: { email: cleanEmail } })
    if (!client || !(await bcrypt.compare(password, client.password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const payload = { id: client.id, email: client.email, name: client.name, role: 'client' }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 mins
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({ success: true, user: payload, token: accessToken })
  } catch (error) {
    next(error)
  }
}

// 3. LOGOUT
export function logout(req, res) {
  clearAuthCookies(res)
  res.json({ success: true, message: 'Logged out successfully' })
}

// 4. GET CURRENT ME STATE
export function getMe(req, res) {
  if (req.user) {
    return res.json({
      admin: req.user.role === 'admin' ? req.user : null,
      client: req.user.role === 'client' ? req.user : null,
      adminViewing: req.user.role === 'client' && req.user.adminViewing
    })
  }
  res.json({ admin: null, client: null, adminViewing: false })
}

// 5. FORGOT PASSWORD
export async function forgotPassword(req, res, next) {
  const { email, role } = req.body // role: 'admin' or 'client'
  try {
    const cleanEmail = email.trim().toLowerCase()
    let user = null

    if (role === 'admin') {
      user = await prisma.admin.findUnique({ where: { email: cleanEmail } })
    } else {
      user = await prisma.client.findUnique({ where: { email: cleanEmail } })
    }

    if (!user) {
      // Return 200 to prevent user enumeration attacks
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    if (role === 'admin') {
      await prisma.admin.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: new Date(Date.now() + 3600000)
        }
      })
    } else {
      await prisma.client.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: new Date(Date.now() + 3600000)
        }
      })
    }

    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&role=${role}`
    const emailHtml = `
      <h3>Password Reset Request</h3>
      <p>You requested a password reset. Click the link below to update your password:</p>
      <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
      <p>If you did not request this, please ignore this email. The link is valid for 1 hour.</p>
    `

    await sendAuthEmail(user.email, 'Password Reset Request', emailHtml)

    res.json({ success: true, message: 'Reset link sent successfully.' })
  } catch (error) {
    next(error)
  }
}

// 6. RESET PASSWORD
export async function resetPassword(req, res, next) {
  const { token, password, role } = req.body
  try {
    let user = null
    if (role === 'admin') {
      user = await prisma.admin.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() }
        }
      })
    } else {
      user = await prisma.client.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() }
        }
      })
    }

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' })
    }

    if (role === 'admin') {
      await prisma.admin.update({
        where: { id: user.id },
        data: {
          password: await bcrypt.hash(password, 10),
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      })
    } else {
      await prisma.client.update({
        where: { id: user.id },
        data: {
          password: await bcrypt.hash(password, 10),
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      })
    }

    res.json({ success: true, message: 'Password has been successfully updated.' })
  } catch (error) {
    next(error)
  }
}

// 7. EMAIL VERIFICATION SEND
export async function sendEmailVerification(req, res, next) {
  // Only applicable for Client portal users
  try {
    const client = await prisma.client.findUnique({ where: { id: req.user.id } })
    if (!client) return res.status(404).json({ error: 'Client not found' })
    if (client.verified) return res.status(400).json({ error: 'Client email is already verified' })

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.client.update({
      where: { id: client.id },
      data: {
        verificationToken: token,
        verificationTokenExpires: new Date(Date.now() + 24 * 3600000)
      }
    })

    const verifyURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`
    const emailHtml = `
      <h3>Verify Your Email Address</h3>
      <p>Thank you for choosing Dev.hyd! Click the link below to verify your email and access your client dashboard:</p>
      <p><a href="${verifyURL}" target="_blank">${verifyURL}</a></p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    `

    await sendAuthEmail(client.email, 'Email Verification Request', emailHtml)

    res.json({ success: true, message: 'Verification email sent.' })
  } catch (error) {
    next(error)
  }
}

// 8. EMAIL VERIFICATION CALLBACK
export async function verifyEmail(req, res, next) {
  const { token } = req.body
  try {
    const client = await prisma.client.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date() }
      }
    })

    if (!client) {
      return res.status(400).json({ error: 'Verification token is invalid or has expired.' })
    }

    await prisma.client.update({
      where: { id: client.id },
      data: {
        verified: true,
        verificationToken: null,
        verificationTokenExpires: null
      }
    })

    res.json({ success: true, message: 'Email verified successfully!' })
  } catch (error) {
    next(error)
  }
}
