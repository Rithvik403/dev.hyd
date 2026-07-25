import logger from '../utils/logger.js'

/**
 * Sends a WhatsApp Cloud API template message
 * @param {string} recipientPhone - e.g. 917780252258
 * @param {string} templateName - Name of WhatsApp approved template
 * @param {Array<string>} parameters - Body variable parameters
 */
export async function sendWhatsAppTemplate(recipientPhone, templateName, parameters = []) {
  const token = process.env.WHATSAPP_API_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneId) {
    logger.info(`WhatsApp dispatch skipped (WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set). Target: ${recipientPhone}`)
    return { success: false, reason: 'unconfigured' }
  }

  const cleanPhone = recipientPhone.replace(/\D/g, '')

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: parameters.map(p => ({ type: 'text', text: String(p) }))
            }
          ]
        }
      })
    })

    const data = await response.json()
    if (response.ok) {
      logger.info(`📱 WhatsApp message sent successfully to ${cleanPhone}: ${templateName}`)
      return { success: true, data }
    } else {
      logger.warn(`⚠️ WhatsApp API error to ${cleanPhone}: ${JSON.stringify(data)}`)
      return { success: false, data }
    }
  } catch (err) {
    logger.error(`❌ WhatsApp dispatch failed: ${err.message}`)
    return { success: false, error: err.message }
  }
}

export default { sendWhatsAppTemplate }
