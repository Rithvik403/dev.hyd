import prisma from '../prisma.js'
import { emitSystemEvent, EVENTS } from '../events/eventEmitter.js'
import { sendLeadConfirmationEmail } from '../emails/emailService.js'
import logger from '../utils/logger.js'

export async function createLead(data, reqContext = {}) {
  const cleanEmail = data.email ? data.email.trim().toLowerCase() : null
  const cleanPhone = data.phone.trim()

  // Prevent spam/duplicate lead creation within 15 minutes
  if (cleanEmail) {
    const existing = await prisma.enquiry.findFirst({
      where: {
        email: cleanEmail,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    })
    if (existing) {
      logger.info(`Duplicate lead creation suppressed for ${cleanEmail}`)
      return existing
    }
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      name: data.name.trim(),
      business: data.business ? data.business.trim() : null,
      phone: cleanPhone,
      email: cleanEmail,
      service: data.service.trim(),
      budget: data.budget ? data.budget.trim() : null,
      message: data.message ? data.message.trim() : null,
      status: 'new'
    }
  })

  // Fire System Event
  emitSystemEvent(EVENTS.LEAD_CREATED, enquiry, reqContext)

  // Asynchronously send client confirmation email
  sendLeadConfirmationEmail(enquiry).catch(err => logger.error(`Lead email error: ${err.message}`))

  return enquiry
}

export async function getLeads(query = {}) {
  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '20')
  const skip = (page - 1) * limit

  const where = {}
  if (query.status) where.status = query.status
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  const [leads, total] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.enquiry.count({ where })
  ])

  return { leads, total, page, pages: Math.ceil(total / limit) }
}

export default { createLead, getLeads }
