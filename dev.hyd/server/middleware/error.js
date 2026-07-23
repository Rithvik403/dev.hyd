export default function errorHandler(err, req, res, next) {
  console.error('❌ Error caught by global handler:', err)

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message)
    return res.status(400).json({ error: messages.join(', ') })
  }

  // Handle mongoose duplicate key errors
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(400).json({ error: `That ${field} is already taken.` })
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid session token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Session expired' })
  }

  // General 500 error
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  })
}
