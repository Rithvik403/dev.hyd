import { marked } from 'marked'
import prisma from '../prisma.js'
import nodemailer from 'nodemailer'

// SMTP Transporter Helper
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

// Nodemailer contact enquiry notifier
async function sendEnquiryNotification(enquiry) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your@gmail.com') {
    console.log('📧 Email not configured — enquiry saved to DB only:', enquiry.name)
    return
  }
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Dev.hyd Portfolio" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
      subject: `New Enquiry from ${enquiry.name} — ${enquiry.business || 'No Business name'}`,
      html: `
        <h2>New Website Enquiry 🎉</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #ddd"><b>Name:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Business:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.business || '—'}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #ddd"><b>Phone:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.phone}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Email:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.email || '—'}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #ddd"><b>Service:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.service}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><b>Budget:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.budget}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #ddd"><b>Message:</b></td><td style="padding:8px;border:1px solid #ddd">${enquiry.message || '—'}</td></tr>
        </table>
      `
    })
    console.log('📧 Enquiry notification email sent successfully')
  } catch (err) {
    console.error('📧 Error sending enquiry email:', err.message)
  }
}

// 1. GET HOME PAGE DYNAMIC DATA
export async function getHomeData(req, res, next) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    const services = await prisma.service.findMany({ orderBy: { order: 'asc' } })
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } })
    const galleryItems = await prisma.gallery.findMany({ orderBy: { createdAt: 'desc' } })
    const settings = await prisma.websiteSettings.findUnique({ where: { key: 'global_settings' } }) || {}

    res.json({
      posts,
      services,
      testimonials,
      faqs,
      galleryItems,
      settings
    })
  } catch (error) {
    next(error)
  }
}

// 2. GET BLOG POSTS LIST
export async function getBlogPosts(req, res, next) {
  try {
    const posts = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } })
    res.json(posts)
  } catch (error) {
    next(error)
  }
}

// 3. GET SINGLE POST
export async function getBlogPostBySlug(req, res, next) {
  try {
    const post = await prisma.blogPost.findFirst({ where: { slug: req.params.slug, published: true } })
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json({
      post,
      htmlContent: marked.parse(post.content)
    })
  } catch (error) {
    next(error)
  }
}

// 4. SUBMIT CONTACT FORM ENQUIRY
export async function submitContactForm(req, res, next) {
  const { name, business, phone, email, service, budget, message } = req.body
  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        business,
        phone,
        email,
        service,
        budget,
        message,
        status: 'new'
      }
    })
    
    // Asynchronously send notification email
    sendEnquiryNotification(enquiry).catch(err => console.error('Enquiry Email Error:', err))

    res.json({
      success: true,
      msg: "🎉 Got it! I'll WhatsApp you within 24 hours."
    })
  } catch (error) {
    next(error)
  }
}

// 5. TRACK PUBLIC PROJECT BY ID OR CLIENT EMAIL
export async function trackProject(req, res, next) {
  try {
    const { id } = req.params
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: id },
          { client: { email: { equals: id, mode: 'insensitive' } } }
        ]
      },
      include: {
        client: { select: { name: true, email: true, phone: true } }
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    next(error)
  }
}
