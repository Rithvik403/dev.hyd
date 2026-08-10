import bcrypt from 'bcryptjs'
import prisma from './prisma.js'

let isSeeded = false

export async function ensureDbSeeded() {
  if (isSeeded) return
  try {
    const adminPass = (process.env.ADMIN_PASSWORD || 'admin123').trim()
    const adminAccounts = [
      { email: 'dev.hyd.official@gmail.com', name: 'Dev.hyd Admin', pass: adminPass },
      { email: 'admin@devhyd.com', name: 'Admin', pass: 'admin123' },
      { email: 'neelamrithvik@gmail.com', name: 'Rithvik Admin', pass: 'Rithvik@1909' }
    ]

    for (const acc of adminAccounts) {
      const cleanEmail = acc.email.trim().toLowerCase()
      const existing = await prisma.admin.findUnique({ where: { email: cleanEmail } })
      if (!existing) {
        const hash = await bcrypt.hash(acc.pass, 10)
        await prisma.admin.create({
          data: {
            email: cleanEmail,
            password: hash,
            name: acc.name
          }
        })
      }
    }

    const defaultClients = [
      { name: 'Karthik Reddy', email: 'karthik@modernbistro.com', phone: '+91 98765 43210', pass: 'Client123!' },
      { name: 'Anjali Verma', email: 'anjali@salonstudio.com', phone: '+91 98765 43211', pass: 'Client123!' },
      { name: 'Neha Kapoor', email: 'neha@boutique.com', phone: '+91 98765 43212', pass: 'Client123!' },
      { name: 'Dev Client', email: 'dev.hyd.official@gmail.com', phone: '+91 77802 52258', pass: 'Client123!' }
    ]

    for (const clientAcc of defaultClients) {
      const cleanEmail = clientAcc.email.trim().toLowerCase()
      const existing = await prisma.client.findUnique({ where: { email: cleanEmail } })
      if (!existing) {
        const hash = await bcrypt.hash(clientAcc.pass, 10)
        await prisma.client.create({
          data: {
            name: clientAcc.name,
            email: cleanEmail,
            phone: clientAcc.phone,
            password: hash,
            verified: true
          }
        })
      }
    }

    isSeeded = true
  } catch (err) {
    console.warn('DB seeding note:', err.message)
  }
}
