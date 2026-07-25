import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'
import { emitSystemEvent, EVENTS } from '../events/eventEmitter.js'
import { sendWelcomeClientEmail } from '../emails/emailService.js'

export async function convertLeadToClient(leadId, password = null) {
  const lead = await prisma.enquiry.findUnique({ where: { id: leadId } })
  if (!lead) throw new Error('Lead enquiry not found')

  const cleanEmail = (lead.email || `${lead.phone}@devhyd.com`).toLowerCase().trim()
  const rawPassword = password || `Client${Math.floor(1000 + Math.random() * 9000)}!`
  const passwordHash = await bcrypt.hash(rawPassword, 10)

  // Check if client already exists
  let client = await prisma.client.findUnique({ where: { email: cleanEmail } })
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: lead.name,
        email: cleanEmail,
        phone: lead.phone,
        password: passwordHash,
        verified: true
      }
    })
  }

  // Update enquiry status
  await prisma.enquiry.update({
    where: { id: leadId },
    data: { status: 'converted' }
  })

  // Emit event
  emitSystemEvent(EVENTS.CLIENT_CREATED, { client, lead })

  // Send Welcome Email
  sendWelcomeClientEmail(client, rawPassword).catch(() => {})

  return { client, tempPassword: rawPassword }
}

export async function getClients(query = {}) {
  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '20')
  const skip = (page - 1) * limit

  const where = {}
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        projects: { select: { id: true, title: true, status: true, paymentStatus: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.client.count({ where })
  ])

  return { clients, total, page, pages: Math.ceil(total / limit) }
}

export default { convertLeadToClient, getClients }
