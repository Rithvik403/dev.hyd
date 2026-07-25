import Razorpay from 'razorpay'
import crypto from 'crypto'
import prisma from '../prisma.js'
import { emitSystemEvent, EVENTS } from '../events/eventEmitter.js'
import { sendPaymentReceiptEmail } from '../emails/emailService.js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ─── PUBLIC / CLIENT: Create Razorpay Order ────────────────────────────────
export async function createOrder(req, res, next) {
  const { payment_id, project_id } = req.body
  if (!payment_id || !project_id) {
    return res.status(400).json({ error: 'payment_id and project_id are required' })
  }
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: payment_id, projectId: project_id, status: 'pending' },
    })
    if (!payment) {
      return res.status(404).json({ error: 'Payment installment not found or already paid' })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(payment.amountDue) * 100), // Razorpay needs paise
      currency: 'INR',
      receipt: `rcpt_${payment.id.slice(0, 20)}`,
      notes: { payment_id: payment.id, project_id, label: payment.label },
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: { razorpayOrderId: order.id },
    })

    emitSystemEvent(EVENTS.PAYMENT_CREATED, { paymentId: payment.id, orderId: order.id, amount: payment.amountDue })

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      payment_id: payment.id,
      label: payment.label,
    })
  } catch (error) {
    next(error)
  }
}

// ─── PUBLIC / CLIENT: Verify Payment Signature & Mark Paid ─────────────────
export async function verifyPayment(req, res, next) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_id) {
    return res.status(400).json({ error: 'Missing required payment verification fields' })
  }
  try {
    // Verify Razorpay signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      emitSystemEvent(EVENTS.PAYMENT_FAILED, { payment_id, razorpay_order_id, error: 'Signature mismatch' })
      return res.status(400).json({ error: 'Payment verification failed: invalid signature' })
    }

    const existing = await prisma.payment.findUnique({
      where: { id: payment_id },
      include: { client: true, project: true }
    })
    if (!existing) return res.status(404).json({ error: 'Payment record not found' })
    if (existing.status === 'paid') return res.json({ success: true, alreadyPaid: true })

    // Mark installment as paid
    const payment = await prisma.payment.update({
      where: { id: payment_id },
      data: {
        status: 'paid',
        amountPaid: existing.amountDue,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      },
    })

    // Recalculate project payment totals
    await recalcProjectPayments(payment.projectId)

    // Emit event & Send Email
    emitSystemEvent(EVENTS.PAYMENT_SUCCESS, {
      paymentId: payment.id,
      amount: payment.amountDue,
      label: payment.label,
      clientName: existing.client?.name,
      clientEmail: existing.client?.email,
      clientPhone: existing.client?.phone
    })

    if (existing.client) {
      sendPaymentReceiptEmail(existing.client, payment).catch(() => {})
    }

    res.json({ success: true, payment })
  } catch (error) {
    next(error)
  }
}

// ─── CLIENT / PUBLIC: Get Payments for a Project ───────────────────────────
export async function getProjectPayments(req, res, next) {
  const { projectId } = req.params
  try {
    const payments = await prisma.payment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        label: true,
        amountDue: true,
        amountPaid: true,
        status: true,
        paidAt: true,
        razorpayPaymentId: true,
        createdAt: true,
      },
    })
    res.json(payments)
  } catch (error) {
    next(error)
  }
}

// ─── ADMIN: Create Payment Installment for a Project ───────────────────────
export async function adminCreateInstallment(req, res, next) {
  const { projectId } = req.params
  const { label, amount_due } = req.body
  if (!label || !amount_due) {
    return res.status(400).json({ error: 'label and amount_due are required' })
  }
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const payment = await prisma.payment.create({
      data: {
        projectId,
        clientId: project.clientId,
        label,
        amountDue: Number(amount_due),
        status: 'pending',
      },
    })

    await recalcProjectPayments(projectId)
    res.json({ success: true, payment })
  } catch (error) {
    next(error)
  }
}

// ─── ADMIN: Get All Payments for a Project ─────────────────────────────────
export async function adminGetPayments(req, res, next) {
  const { projectId } = req.params
  try {
    const payments = await prisma.payment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    })
    res.json(payments)
  } catch (error) {
    next(error)
  }
}

// ─── ADMIN: Delete Unpaid Installment ──────────────────────────────────────
export async function adminDeleteInstallment(req, res, next) {
  const { id } = req.params
  try {
    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    if (payment.status === 'paid') {
      return res.status(400).json({ error: 'Cannot delete a paid installment' })
    }
    await prisma.payment.delete({ where: { id } })
    await recalcProjectPayments(payment.projectId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// ─── ADMIN: Mark Payment as Paid Manually (cash/offline) ───────────────────
export async function adminMarkPaid(req, res, next) {
  const { id } = req.params
  try {
    const existing = await prisma.payment.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Payment not found' })
    if (existing.status === 'paid') {
      return res.status(400).json({ error: 'Payment is already marked as paid' })
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status: 'paid', amountPaid: existing.amountDue, paidAt: new Date() },
    })

    await recalcProjectPayments(payment.projectId)
    res.json({ success: true, payment })
  } catch (error) {
    next(error)
  }
}

// ─── RAZORPAY WEBHOOK ───────────────────────────────────────────────────────
export async function razorpayWebhook(req, res) {
  const signature = req.headers['x-razorpay-signature']
  const rawBody = req.rawBody

  try {
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')

    if (expectedSig !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    const event = req.body.event

    if (event === 'payment.captured') {
      const rp = req.body.payload.payment.entity
      await prisma.payment.updateMany({
        where: { razorpayOrderId: rp.order_id, status: { not: 'paid' } },
        data: {
          status: 'paid',
          amountPaid: rp.amount / 100,
          razorpayPaymentId: rp.id,
          paidAt: new Date(),
        },
      })
      // Re-fetch to get projectId for recalc
      const pmt = await prisma.payment.findFirst({ where: { razorpayOrderId: rp.order_id } })
      if (pmt) await recalcProjectPayments(pmt.projectId)
    }

    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
}

// ─── HELPER: Recalculate project payment totals ─────────────────────────────
async function recalcProjectPayments(projectId) {
  const allPayments = await prisma.payment.findMany({ where: { projectId } })
  const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amountPaid), 0)
  const totalDue = allPayments.reduce((sum, p) => sum + Number(p.amountDue), 0)
  const allPaid = allPayments.length > 0 && allPayments.every((p) => p.status === 'paid')
  const anyPaid = allPayments.some((p) => p.status === 'paid')

  await prisma.project.update({
    where: { id: projectId },
    data: {
      paymentAmountTotal: totalDue,
      paymentAmountPaid: totalPaid,
      paymentStatus: allPaid ? 'Paid' : anyPaid ? 'Partial' : 'Unpaid',
    },
  })
}
