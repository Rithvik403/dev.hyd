import prisma from '../prisma.js'
import { emitSystemEvent, EVENTS } from '../events/eventEmitter.js'
import { sendInvoiceEmail } from '../emails/emailService.js'

export async function createInvoice({ projectId, clientId, amountTotal, amountTax = 0, dueDate, items = [] }) {
  const count = await prisma.invoice.count()
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  const total = parseFloat(amountTotal)
  const tax = parseFloat(amountTax)
  const due = total + tax

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      projectId,
      clientId,
      amountTotal: total,
      amountTax: tax,
      amountDue: due,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'unpaid',
      items
    },
    include: { client: true, project: true }
  })

  emitSystemEvent(EVENTS.INVOICE_GENERATED, {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    amountTotal: invoice.amountTotal,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    clientPhone: invoice.client.phone
  })

  sendInvoiceEmail(invoice.client, invoice).catch(() => {})

  return invoice
}

export async function getInvoices(query = {}) {
  const page = parseInt(query.page || '1')
  const limit = parseInt(query.limit || '20')
  const skip = (page - 1) * limit

  const where = {}
  if (query.clientId) where.clientId = query.clientId
  if (query.projectId) where.projectId = query.projectId
  if (query.status) where.status = query.status

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { client: { select: { name: true, email: true } }, project: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.invoice.count({ where })
  ])

  return { invoices, total, page, pages: Math.ceil(total / limit) }
}

export default { createInvoice, getInvoices }
