// Centralized Structured Logging Utility for dev.hyd SaaS Platform

class Logger {
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : ''
    return `[${timestamp}] [${level}] ${message} ${metaString}`.trim()
  }

  info(message, meta) {
    console.log(this.formatMessage('INFO', message, meta))
  }

  warn(message, meta) {
    console.warn(this.formatMessage('WARN', message, meta))
  }

  error(message, meta) {
    console.error(this.formatMessage('ERROR', message, meta))
  }

  audit(event, message, meta) {
    console.log(this.formatMessage('AUDIT', `[${event}] ${message}`, meta))
  }

  event(event, payload) {
    console.log(this.formatMessage('EVENT', `⚡ Emitted: ${event}`, { event, payload }))
  }
}

export const logger = new Logger()
export default logger
