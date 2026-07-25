import nodemailer from 'nodemailer'
import logger from '../utils/logger.js'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Base HTML Wrapper
function wrapHtmlTemplate(title, bodyHtml) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header h1 span { color: #FF4D00; }
        .content { padding: 32px 24px; font-size: 15px; line-height: 1.6; }
        .btn { display: inline-block; background: #FF4D00; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 16px; }
        .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>dev<span>.hyd</span></h1>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} dev.hyd • Premium Web Engineering for Local Businesses in Hyderabad.<br/>
          Need urgent help? Reply directly to this email or WhatsApp +91 77802 52258.
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generic mail sender wrapper
 */
export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your@gmail.com') {
    logger.info(`📧 SMTP disabled — would have sent email to ${to}: "${subject}"`)
    return { success: false, reason: 'unconfigured' }
  }

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: `"dev.hyd Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    })
    logger.info(`📧 Email dispatched to ${to} [ID: ${info.messageId}]`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    logger.error(`❌ Email dispatch error to ${to}: ${err.message}`)
    return { success: false, error: err.message }
  }
}

// 1. LEAD SUBMISSION CONFIRMATION
export async function sendLeadConfirmationEmail(enquiry) {
  const html = wrapHtmlTemplate(
    'Enquiry Received',
    `
      <h2>Hi ${enquiry.name},</h2>
      <p>Thank you for reaching out to <strong>dev.hyd</strong> for <strong>${enquiry.service || 'your website project'}</strong>!</p>
      <p>I have received your details and will WhatsApp/call you at <strong>${enquiry.phone}</strong> within 24 hours to discuss your custom project requirements and set up your 2-day free demo preview.</p>
      <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #FF4D00; margin: 16px 0; border-radius: 4px;">
        <strong>Your Enquiry Details:</strong><br/>
        • <strong>Business:</strong> ${enquiry.business || 'N/A'}<br/>
        • <strong>Selected Package/Service:</strong> ${enquiry.service}<br/>
        • <strong>Estimated Budget:</strong> ${enquiry.budget || 'Custom'}
      </div>
      <p>Best regards,<br/><strong>Rithvik</strong><br/>Founder & Lead Developer, dev.hyd</p>
    `
  )
  return sendEmail({ to: enquiry.email || process.env.NOTIFY_EMAIL, subject: `🎉 We received your enquiry, ${enquiry.name}! — dev.hyd`, html })
}

// 2. WELCOME CLIENT EMAIL
export async function sendWelcomeClientEmail(client, temporaryPassword = null) {
  const loginUrl = `${process.env.CLIENT_URL || 'https://devhyd.com'}/client/login`
  const passwordSection = temporaryPassword ? `<p style="background: #fff7ed; padding: 12px; border: 1px solid #ffedd5; border-radius: 6px;"><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>` : ''
  const html = wrapHtmlTemplate(
    'Welcome to dev.hyd',
    `
      <h2>Welcome to dev.hyd, ${client.name}!</h2>
      <p>Your client portal account has been created. You can now track project progress in real-time, view design previews, manage invoices, and communicate directly with our engineering team.</p>
      ${passwordSection}
      <p><a href="${loginUrl}" class="btn">Log In to Client Portal →</a></p>
    `
  )
  return sendEmail({ to: client.email, subject: `🚀 Welcome to your dev.hyd Client Portal!`, html })
}

// 3. PROJECT CREATED EMAIL
export async function sendProjectCreatedEmail(client, project) {
  const trackerUrl = `${process.env.CLIENT_URL || 'https://devhyd.com'}/track/${project.id}`
  const html = wrapHtmlTemplate(
    'New Project Initialized',
    `
      <h2>Hi ${client.name},</h2>
      <p>Your new project <strong>"${project.title}"</strong> has been initialized!</p>
      <p>You can monitor live progress, milestone timelines, and staging links at any time using your tracker link below:</p>
      <p><a href="${trackerUrl}" class="btn">View Live Project Tracker →</a></p>
    `
  )
  return sendEmail({ to: client.email, subject: `🛠️ Project Initialized: ${project.title} — dev.hyd`, html })
}

// 4. PAYMENT RECEIPT EMAIL
export async function sendPaymentReceiptEmail(client, payment) {
  const html = wrapHtmlTemplate(
    'Payment Receipt',
    `
      <h2>Payment Confirmation</h2>
      <p>Hi ${client.name}, we have received your payment for <strong>${payment.label}</strong>.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <strong style="color: #166534;">Payment Details:</strong><br/>
        • <strong>Amount Paid:</strong> ₹${Number(payment.amountDue).toLocaleString('en-IN')}<br/>
        • <strong>Status:</strong> Paid & Verified ✅<br/>
        • <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
      </div>
      <p>Thank you for choosing dev.hyd!</p>
    `
  )
  return sendEmail({ to: client.email, subject: `✅ Payment Received: ₹${Number(payment.amountDue).toLocaleString('en-IN')} — dev.hyd`, html })
}

// 5. INVOICE DELIVERY EMAIL
export async function sendInvoiceEmail(client, invoice) {
  const html = wrapHtmlTemplate(
    'Invoice Issued',
    `
      <h2>Invoice #${invoice.invoiceNumber}</h2>
      <p>Hi ${client.name}, an invoice has been generated for your project milestone.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
        • <strong>Invoice Number:</strong> ${invoice.invoiceNumber}<br/>
        • <strong>Total Amount:</strong> ₹${Number(invoice.amountTotal).toLocaleString('en-IN')}<br/>
        • <strong>Amount Due:</strong> ₹${Number(invoice.amountDue).toLocaleString('en-IN')}
      </div>
      <p><a href="${process.env.CLIENT_URL || 'https://devhyd.com'}/client/dashboard" class="btn">Pay Invoice Online →</a></p>
    `
  )
  return sendEmail({ to: client.email, subject: `📄 Invoice #${invoice.invoiceNumber} Issued — dev.hyd`, html })
}

// 6. PASSWORD RESET EMAIL
export async function sendPasswordResetEmail(user, resetUrl) {
  const html = wrapHtmlTemplate(
    'Password Reset Request',
    `
      <h2>Reset Your Password</h2>
      <p>Hi ${user.name}, we received a request to reset your dev.hyd portal password.</p>
      <p><a href="${resetUrl}" class="btn">Reset Password →</a></p>
      <p style="font-size: 12px; color: #64748b; margin-top: 16px;">If you did not request this password reset, please ignore this email.</p>
    `
  )
  return sendEmail({ to: user.email, subject: `🔒 Password Reset Request — dev.hyd`, html })
}

export default {
  sendLeadConfirmationEmail,
  sendWelcomeClientEmail,
  sendProjectCreatedEmail,
  sendPaymentReceiptEmail,
  sendInvoiceEmail,
  sendPasswordResetEmail
}
