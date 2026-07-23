import prisma from '../prisma.js'
import { signAccessToken } from '../middleware/auth.js'
import { uploadFileToStorage } from '../middleware/upload.js'

// 1. GET CLIENT DASHBOARD
export async function getClientDashboard(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    const messages = await prisma.message.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: 'asc' }
    })
    const notifications = await prisma.notification.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    const client = await prisma.client.findUnique({ where: { id: req.user.id } })

    res.json({
      client,
      projects,
      messages,
      notifications,
      adminViewing: req.user.adminViewing || false
    })
  } catch (error) {
    next(error)
  }
}

// 2. GET CLIENT PROJECT DETAIL
export async function getClientProjectDetail(req, res, next) {
  try {
    const project = await prisma.project.findFirst({ where: { id: req.params.id, clientId: req.user.id } })
    if (!project) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this project' })
    }
    const client = await prisma.client.findUnique({ where: { id: req.user.id } })
    res.json({
      client,
      project,
      adminViewing: req.user.adminViewing || false
    })
  } catch (error) {
    next(error)
  }
}

// 3. SEND MESSAGE TO ADMIN
export async function sendMessage(req, res, next) {
  const { text, project_id } = req.body
  try {
    const message = await prisma.message.create({
      data: {
        clientId: req.user.id,
        projectId: project_id || null,
        senderRole: 'client',
        text
      }
    })
    res.json({ success: true, message })
  } catch (error) {
    next(error)
  }
}

// 4. GET MESSAGES
export async function getMessages(req, res, next) {
  try {
    const messages = await prisma.message.findMany({ where: { clientId: req.user.id }, orderBy: { createdAt: 'asc' } })
    res.json(messages)
  } catch (error) {
    next(error)
  }
}

// 5. UPLOAD FILE TO PROJECT
export async function uploadClientFile(req, res, next) {
  try {
    const project = await prisma.project.findFirst({ where: { id: req.params.id, clientId: req.user.id } })
    if (!project) return res.status(404).json({ error: 'Project not found or access denied' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const fileUrl = await uploadFileToStorage(req.file)
    const nextFiles = [...(project.files || []), { name: req.body.name || req.file.originalname, url: fileUrl }]

    await prisma.project.update({
      where: { id: project.id },
      data: { files: nextFiles }
    })
    res.json({ success: true, file: nextFiles[nextFiles.length - 1] })
  } catch (error) {
    next(error)
  }
}

// 6. UPDATE PROFILE
export async function updateProfile(req, res, next) {
  const { name, phone } = req.body
  try {
    const client = await prisma.client.findUnique({ where: { id: req.user.id } })
    if (!client) return res.status(404).json({ error: 'Client not found' })

    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: { name: name || client.name, phone: phone !== undefined ? phone : client.phone }
    })
    res.json({ success: true, client: { id: updatedClient.id, name: updatedClient.name, email: updatedClient.email, phone: updatedClient.phone } })
  } catch (error) {
    next(error)
  }
}

// 7. MARK NOTIFICATIONS AS READ
export async function markNotificationsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({ where: { clientId: req.user.id, read: false }, data: { read: true } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 8. BACK TO ADMIN EMULATION ROLLBACK
export function backToAdmin(req, res) {
  if (req.user && req.user.adminViewing && req.user.admin) {
    // Sign new access token for admin
    const payload = {
      id: req.user.admin.id,
      email: req.user.admin.email,
      name: req.user.admin.name,
      role: 'admin'
    }

    const accessToken = signAccessToken(payload)

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 mins
    })

    return res.json({ success: true, redirect: '/admin' })
  }
  res.status(401).json({ error: 'Unauthorized: Admin session required' })
}
