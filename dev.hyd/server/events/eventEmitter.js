import { EventEmitter } from 'events'
import logger from '../utils/logger.js'
import prisma from '../prisma.js'
import { dispatchEventToN8n } from '../automation/n8nService.js'
import { sendWhatsAppTemplate } from '../automation/whatsappService.js'

class SystemEventEmitter extends EventEmitter {}

export const systemEvents = new SystemEventEmitter()

// Event Name Constants
export const EVENTS = {
  CONTACT_CREATED: 'CONTACT_CREATED',
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  CLIENT_CREATED: 'CLIENT_CREATED',
  CLIENT_UPDATED: 'CLIENT_UPDATED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  CLIENT_LOGIN: 'CLIENT_LOGIN',
  ADMIN_LOGIN: 'ADMIN_LOGIN'
}

/**
 * Emit a typed system event across dev.hyd
 * @param {string} eventName - One of EVENTS constants
 * @param {Object} payload - Event context metadata
 * @param {Object} options - Optional audit context (userId, userRole, ipAddress, userAgent)
 */
export function emitSystemEvent(eventName, payload = {}, options = {}) {
  logger.event(eventName, payload)

  // 1. Fire in-memory event listeners
  systemEvents.emit(eventName, payload)

  // 2. Persist audit log entry to PostgreSQL asynchronously
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
    }).catch(err => logger.error(`Failed to log activity for ${eventName}: ${err.message}`))
  } catch (err) {
    logger.error(`Database log exception for ${eventName}: ${err.message}`)
  }

  // 3. Dispatch event to n8n Webhook asynchronously
  dispatchEventToN8n(eventName, payload).catch(err => logger.error(`n8n dispatch failed for ${eventName}: ${err.message}`))

  // 4. Optionally send WhatsApp notification for high-priority client events
  if (eventName === EVENTS.PROJECT_UPDATED && payload.clientPhone) {
    sendWhatsAppTemplate(payload.clientPhone, 'project_update', [payload.title || 'Project', payload.status || 'Updated']).catch(() => {})
  } else if (eventName === EVENTS.PAYMENT_SUCCESS && payload.clientPhone) {
    sendWhatsAppTemplate(payload.clientPhone, 'payment_receipt', [payload.amount || '0', payload.label || 'Invoice']).catch(() => {})
  }
}

export default emitSystemEvent
