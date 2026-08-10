import logger from '../utils/logger.js'

/**
 * Maps specific lifecycle events to optional dedicated n8n webhook env variables
 * @param {string} eventName 
 * @returns {string|null}
 */
function resolveWebhookUrl(eventName) {
  if (['CONTACT_CREATED', 'CONTACT_UPDATED', 'LEAD_CREATED', 'LEAD_UPDATED', 'new_enquiry'].includes(eventName)) {
    return process.env.N8N_LEAD_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
  }
  if (['CLIENT_CREATED', 'CLIENT_UPDATED', 'USER_REGISTERED'].includes(eventName)) {
    return process.env.N8N_CLIENT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
  }
  if (['PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_COMPLETED'].includes(eventName)) {
    return process.env.N8N_PROJECT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
  }
  if (['PAYMENT_CREATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'INVOICE_CREATED', 'INVOICE_PAID'].includes(eventName)) {
    return process.env.N8N_PAYMENT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
  }
  return process.env.N8N_WEBHOOK_URL
}

/**
 * Dispatches an event payload asynchronously to n8n automation webhooks
 * @param {string} eventName
 * @param {Object} payload
 */
export async function dispatchEventToN8n(eventName, payload) {
  const webhookUrl = resolveWebhookUrl(eventName)
  if (!webhookUrl) {
    logger.info(`n8n webhook skipped for ${eventName} (N8N_WEBHOOK_URL not configured)`)
    return { success: false, reason: 'unconfigured' }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DevHyd-Event': eventName,
        'X-DevHyd-Secret': process.env.N8N_WEBHOOK_SECRET || 'devhyd-event-secret'
      },
      body: JSON.stringify({
        event: eventName,
        data: payload,
        timestamp: new Date().toISOString()
      })
    })

    if (res.ok) {
      logger.info(`⚡ n8n Webhook dispatched successfully [${eventName}]: ${res.status}`)
      return { success: true, status: res.status }
    } else {
      logger.warn(`⚠️ n8n Webhook returned non-200 [${eventName}]: ${res.status}`)
      return { success: false, status: res.status }
    }
  } catch (err) {
    logger.error(`❌ n8n Webhook dispatch error [${eventName}]: ${err.message}`)
    return { success: false, error: err.message }
  }
}

export default { dispatchEventToN8n }
