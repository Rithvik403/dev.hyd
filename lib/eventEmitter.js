import EventEmitter from 'events'
import prisma from './prisma.js'

class SystemEventEmitter extends EventEmitter {}
export const systemEvents = new SystemEventEmitter()

export const EVENTS = {
  CONTACT_CREATED: 'CONTACT_CREATED',
  CONTACT_UPDATED: 'CONTACT_UPDATED',
  CLIENT_CREATED: 'CLIENT_CREATED',
  CLIENT_UPDATED: 'CLIENT_UPDATED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVOICE_CREATED: 'INVOICE_CREATED',
  INVOICE_PAID: 'INVOICE_PAID',
  FILE_UPLOADED: 'FILE_UPLOADED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  CLIENT_LOGIN: 'CLIENT_LOGIN',
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  USER_REGISTERED: 'USER_REGISTERED',
  PASSWORD_RESET: 'PASSWORD_RESET'
}

export async function emitSystemEvent(eventName, payload = {}, options = {}) {
  systemEvents.emit(eventName, payload)

  // Persist audit log
  try {
    prisma.activityLog.create({
      data: {
        userId: options.userId || payload.userId || payload.id || null,
        userRole: options.userRole || payload.role || 'system',
        event: eventName,
        description: payload.message || payload.note || `Event ${eventName} triggered`,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        metadata: payload
      }
    }).catch(() => {})
  } catch {}

  // Dispatch to n8n Webhook if configured
  const n8nUrl = process.env.N8N_WEBHOOK_URL
  if (n8nUrl) {
    fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, payload, timestamp: new Date().toISOString() })
    }).catch(() => {})
  }
}

export default emitSystemEvent
