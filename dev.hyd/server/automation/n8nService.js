import logger from '../utils/logger.js'

/**
 * Dispatches an event payload asynchronously to n8n automation webhooks
 * @param {string} eventName
 * @param {Object} payload
 */
export async function dispatchEventToN8n(eventName, payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_PROJECT_WEBHOOK_URL
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
