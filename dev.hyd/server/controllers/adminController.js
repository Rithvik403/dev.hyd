import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'
import { signAccessToken, getAuthCookieOptions } from '../middleware/auth.js'
import { uploadFileToStorage } from '../middleware/upload.js'
import { emitSystemEvent, EVENTS } from '../events/eventEmitter.js'

// 1. DASHBOARD OVERVIEW DATA
export async function getDashboardData(req, res, next) {
  try {
    const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } })
    const newCount = enquiries.filter(e => e.status === 'new').length
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } })
    const projects = await prisma.project.findMany({ include: { client: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } })
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
    const services = await prisma.service.findMany({ orderBy: { order: 'asc' } })
    const galleryItems = await prisma.gallery.findMany({ orderBy: { createdAt: 'desc' } })
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } })
    const settings = await prisma.websiteSettings.findUnique({ where: { key: 'global_settings' } }) || {}

    res.json({
      admin: req.user,
      enquiries,
      clients,
      projects,
      posts,
      testimonials,
      services,
      galleryItems,
      faqs,
      settings,
      stats: {
        enquiries: enquiries.length,
        newCount,
        clients: clients.length,
        projects: projects.length
      }
    })
  } catch (error) {
    next(error)
  }
}

// 2. CLIENT PORTAL EMULATION
export async function emulateClient(req, res, next) {
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id } })
    if (!client) return res.status(404).json({ error: 'Client not found' })

    const payload = {
      id: client.id,
      email: client.email,
      name: client.name,
      role: 'client',
      adminViewing: true,
      admin: { id: req.user.id, email: req.user.email, name: req.user.name }
    }

    const accessToken = signAccessToken(payload)

    res.cookie('accessToken', accessToken, getAuthCookieOptions(15 * 60 * 1000))

    res.json({ success: true, redirect: '/client' })
  } catch (error) {
    next(error)
  }
}

// 3. ENQUIRIES CRUD
export async function updateEnquiryStatus(req, res, next) {
  try {
    const e = await prisma.enquiry.update({ where: { id: req.params.id }, data: { status: req.body.status } })
    if (!e) return res.status(404).json({ error: 'Enquiry not found' })
    res.json({ success: true, enquiry: e })
  } catch (error) {
    next(error)
  }
}

export async function deleteEnquiry(req, res, next) {
  try {
    const e = await prisma.enquiry.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!e) return res.status(404).json({ error: 'Enquiry not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 4. CLIENTS CRUD
export async function createClient(req, res, next) {
  const { name, email, phone, password } = req.body
  try {
    const cleanEmail = email.trim().toLowerCase()
    const existing = await prisma.client.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    const hash = await bcrypt.hash(password, 10)
    const client = await prisma.client.create({ data: { name, email: cleanEmail, phone, password: hash, verified: true } })

    emitSystemEvent(EVENTS.CLIENT_CREATED, { id: client.id, name: client.name, email: client.email, phone: client.phone }, { userId: req.user.id, userRole: 'admin' })

    res.json({ success: true, client: { id: client.id, name: client.name, email: client.email } })
  } catch (error) {
    next(error)
  }
}

export async function updateClient(req, res, next) {
  const { name, email, phone, password } = req.body
  try {
    const cleanEmail = email.trim().toLowerCase()
    const client = await prisma.client.findUnique({ where: { id: req.params.id } })
    if (!client) return res.status(404).json({ error: 'Client not found' })

    const updateData = {}
    if (email && cleanEmail !== client.email) {
      const existing = await prisma.client.findUnique({ where: { email: cleanEmail } })
      if (existing) return res.status(400).json({ error: 'Email is already in use' })
      updateData.email = cleanEmail
    }

    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const updatedClient = await prisma.client.update({ where: { id: client.id }, data: updateData })

    emitSystemEvent(EVENTS.CLIENT_UPDATED, { id: updatedClient.id, name: updatedClient.name, email: updatedClient.email }, { userId: req.user.id, userRole: 'admin' })

    res.json({ success: true, client: updatedClient })
  } catch (error) {
    next(error)
  }
}

export async function deleteClient(req, res, next) {
  try {
    const client = await prisma.client.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!client) return res.status(404).json({ error: 'Client not found' })
    await prisma.project.deleteMany({ where: { clientId: req.params.id } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 5. PROJECTS CRUD
export async function createProject(req, res, next) {
  const { client_id, title, description, status, deadline, package: pkg, payment_status, payment_amount_total, payment_amount_paid } = req.body
  try {
    if (!client_id) {
      return res.status(400).json({ error: 'Please select or register a client for this project' })
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required' })
    }

    const totalAmt = Number(payment_amount_total || 0)
    const paidAmt = Number(payment_amount_paid || 0)
    const calculatedStatus = payment_status || (paidAmt >= totalAmt && totalAmt > 0 ? 'Paid' : paidAmt > 0 ? 'Partially Paid' : 'Unpaid')

    let deadlineDate = null
    if (deadline) {
      const d = new Date(deadline)
      if (!isNaN(d.getTime())) {
        deadlineDate = d
      }
    }

    const project = await prisma.project.create({
      data: {
        clientId: client_id,
        title: title.trim(),
        description: description ? description.trim() : null,
        status: status || 'Discovery',
        deadline: deadlineDate,
        package: pkg || null,
        paymentStatus: calculatedStatus,
        paymentAmountTotal: totalAmt,
        paymentAmountPaid: paidAmt,
        updates: []
      }
    })

    // Automatically create initial payment milestone installment if project has a payment total
    if (totalAmt > 0) {
      const isFullPaid = paidAmt >= totalAmt
      await prisma.payment.create({
        data: {
          projectId: project.id,
          clientId: client_id,
          label: `Project Payment (${pkg || title})`,
          amountDue: totalAmt,
          amountPaid: paidAmt,
          status: isFullPaid ? 'paid' : 'pending',
          paidAt: isFullPaid ? new Date() : null
        }
      })
    }

    emitSystemEvent(EVENTS.PROJECT_CREATED, { id: project.id, title: project.title, status: project.status, clientId: project.clientId }, { userId: req.user.id, userRole: 'admin' })

    res.json({ success: true, project })
  } catch (error) {
    next(error)
  }
}

export async function updateProject(req, res, next) {
  const { 
    title, 
    description, 
    deadline, 
    package: pkg, 
    status, 
    payment_status, 
    paymentStatus,
    payment_amount_total, 
    paymentAmountTotal,
    total,
    payment_amount_paid, 
    paymentAmountPaid,
    paid 
  } = req.body

  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Project not found' })

    // Resolve payment status, total, and paid from any field naming convention
    const newTotal = total !== undefined ? Number(total) : (payment_amount_total !== undefined ? Number(payment_amount_total) : (paymentAmountTotal !== undefined ? Number(paymentAmountTotal) : existing.paymentAmountTotal))
    const newPaid = paid !== undefined ? Number(paid) : (payment_amount_paid !== undefined ? Number(payment_amount_paid) : (paymentAmountPaid !== undefined ? Number(paymentAmountPaid) : existing.paymentAmountPaid))
    
    let newStatus = payment_status || paymentStatus
    if (!newStatus) {
      if (newPaid >= newTotal && newTotal > 0) newStatus = 'Paid'
      else if (newPaid > 0) newStatus = 'Partially Paid'
      else newStatus = existing.paymentStatus || 'Unpaid'
    }

    let deadlineDate = existing.deadline
    if (deadline !== undefined) {
      if (deadline) {
        const d = new Date(deadline)
        deadlineDate = !isNaN(d.getTime()) ? d : null
      } else {
        deadlineDate = null
      }
    }

    const updates = [...(existing.updates || [])]
    const nextData = {
      title: title || existing.title,
      description: description !== undefined ? description : existing.description,
      deadline: deadlineDate,
      package: pkg !== undefined ? pkg : existing.package,
      paymentStatus: newStatus,
      paymentAmountTotal: newTotal,
      paymentAmountPaid: newPaid
    }

    const isCompleted = status === 'Completed' || status === 'Live'
    if (status && status !== existing.status) {
      updates.push({ status, note: 'Status updated by Admin', date: new Date() })
      nextData.status = status
      nextData.updates = updates
    }

    const project = await prisma.project.update({ where: { id: req.params.id }, data: nextData })

    // Sync or update payment installment breakdown
    const existingPayments = await prisma.payment.findMany({ where: { projectId: project.id } })
    if (existingPayments.length === 0 && newTotal > 0) {
      await prisma.payment.create({
        data: {
          projectId: project.id,
          clientId: project.clientId,
          label: `Project Payment (${project.package || project.title})`,
          amountDue: newTotal,
          amountPaid: newPaid,
          status: newPaid >= newTotal ? 'paid' : 'pending',
          paidAt: newPaid >= newTotal ? new Date() : null
        }
      })
    } else if (existingPayments.length === 1) {
      const singlePmt = existingPayments[0]
      await prisma.payment.update({
        where: { id: singlePmt.id },
        data: {
          amountDue: newTotal,
          amountPaid: newPaid,
          status: newPaid >= newTotal ? 'paid' : (newPaid > 0 ? 'pending' : singlePmt.status),
          paidAt: newPaid >= newTotal && !singlePmt.paidAt ? new Date() : singlePmt.paidAt
        }
      })
    }

    const eventName = isCompleted ? EVENTS.PROJECT_COMPLETED : EVENTS.PROJECT_UPDATED
    emitSystemEvent(eventName, { id: project.id, title: project.title, status: project.status, clientId: project.clientId }, { userId: req.user.id, userRole: 'admin' })

    res.json({ success: true, project })
  } catch (error) {
    next(error)
  }
}

export async function addProjectTimelineUpdate(req, res, next) {
  const { status, note } = req.body
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { client: true } })
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const updates = [...(project.updates || []), { status, note: note || '', date: new Date() }]
    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: { status, updates }
    })

    // Asynchronously trigger n8n workflow for project update
    const n8nUrl = process.env.N8N_PROJECT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
    if (n8nUrl) {
      fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'project_status_update',
          project: {
            id: updatedProject.id,
            title: updatedProject.title,
            status: updatedProject.status,
            clientName: project.client?.name,
            clientEmail: project.client?.email,
            latestNote: note || ''
          },
          timestamp: new Date().toISOString()
        })
      })
      .then(r => console.log('⚡ n8n Project Webhook triggered:', r.status))
      .catch(err => console.error('⚠️ n8n Project Webhook Error:', err.message))
    }

    res.json({ success: true, project: updatedProject })
  } catch (error) {
    next(error)
  }
}

// Add files to project
export async function uploadProjectFile(req, res, next) {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const fileUrl = await uploadFileToStorage(req.file)
    const nextFiles = [...(project.files || []), { name: req.body.name || req.file.originalname, url: fileUrl }]
    await prisma.project.update({ where: { id: req.params.id }, data: { files: nextFiles } })
    res.json({ success: true, file: nextFiles[nextFiles.length - 1] })
  } catch (error) {
    next(error)
  }
}

export async function deleteProject(req, res, next) {
  try {
    const p = await prisma.project.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!p) return res.status(404).json({ error: 'Project not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 6. BLOGS CRUD
export async function createBlogPost(req, res, next) {
  const { title, slug, excerpt, content, published } = req.body
  try {
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) return res.status(400).json({ error: 'Slug already exists' })

    let coverUrl = ''
    if (req.file) {
      coverUrl = await uploadFileToStorage(req.file)
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        published: published === true || published === 'true',
        cover: coverUrl || req.body.cover || '',
        author: req.user.name
      }
    })
    res.json({ success: true, post })
  } catch (error) {
    next(error)
  }
}

export async function updateBlogPost(req, res, next) {
  const { title, slug, excerpt, content, published } = req.body
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Blog post not found' })

    if (slug && slug !== post.slug) {
      const existing = await prisma.blogPost.findUnique({ where: { slug } })
      if (existing) return res.status(400).json({ error: 'Slug already exists' })
      post.slug = slug
    }

    const updateData = {
      title: title || post.title,
      excerpt: excerpt !== undefined ? excerpt : post.excerpt,
      content: content || post.content,
      published: published !== undefined ? (published === true || published === 'true') : post.published
    }

    if (req.file) {
      updateData.cover = await uploadFileToStorage(req.file)
    } else if (req.body.cover !== undefined) {
      updateData.cover = req.body.cover
    }

    const updatedPost = await prisma.blogPost.update({ where: { id: post.id }, data: updateData })
    res.json({ success: true, post: updatedPost })
  } catch (error) {
    next(error)
  }
}

export async function deleteBlogPost(req, res, next) {
  try {
    const post = await prisma.blogPost.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 7. SERVICES CRUD
export async function getServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({ orderBy: { order: 'asc' } })
    res.json(services)
  } catch (error) {
    next(error)
  }
}

export async function createService(req, res, next) {
  const { title, description, price, icon, order } = req.body
  try {
    const service = await prisma.service.create({ data: { title, description, price, icon, order: order || 0 } })
    res.json({ success: true, service })
  } catch (error) {
    next(error)
  }
}

export async function updateService(req, res, next) {
  const { title, description, price, icon, order } = req.body
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } })
    if (!service) return res.status(404).json({ error: 'Service not found' })

    const updateData = {
      title: title || service.title,
      description: description !== undefined ? description : service.description,
      price: price || service.price,
      icon: icon || service.icon,
      order: order !== undefined ? order : service.order
    }

    const updatedService = await prisma.service.update({ where: { id: service.id }, data: updateData })
    res.json({ success: true, service: updatedService })
  } catch (error) {
    next(error)
  }
}

export async function deleteService(req, res, next) {
  try {
    const s = await prisma.service.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!s) return res.status(404).json({ error: 'Service not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 8. TESTIMONIALS CRUD
export async function getTestimonials(req, res, next) {
  try {
    const list = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(list)
  } catch (error) {
    next(error)
  }
}

export async function createTestimonial(req, res, next) {
  const { name, text, business, stars } = req.body
  try {
    let avatarUrl = ''
    if (req.file) {
      avatarUrl = await uploadFileToStorage(req.file)
    }

    const t = await prisma.testimonial.create({
      data: {
        name,
        text,
        business,
        stars: stars || 5,
        avatar: avatarUrl || req.body.avatar || '/images/avatar-default.png'
      }
    })
    res.json({ success: true, testimonial: t })
  } catch (error) {
    next(error)
  }
}

export async function updateTestimonial(req, res, next) {
  const { name, text, business, stars } = req.body
  try {
    const t = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
    if (!t) return res.status(404).json({ error: 'Testimonial not found' })

    const updateData = {
      name: name || t.name,
      text: text || t.text,
      business: business !== undefined ? business : t.business,
      stars: stars !== undefined ? stars : t.stars
    }

    if (req.file) {
      updateData.avatar = await uploadFileToStorage(req.file)
    } else if (req.body.avatar !== undefined) {
      updateData.avatar = req.body.avatar
    }

    const updatedTestimonial = await prisma.testimonial.update({ where: { id: t.id }, data: updateData })
    res.json({ success: true, testimonial: updatedTestimonial })
  } catch (error) {
    next(error)
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    const t = await prisma.testimonial.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!t) return res.status(404).json({ error: 'Testimonial not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 9. GALLERY CRUD
export async function getGallery(req, res, next) {
  try {
    const list = await prisma.gallery.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(list)
  } catch (error) {
    next(error)
  }
}

export async function createGalleryItem(req, res, next) {
  const { title, tags, category } = req.body
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'An image is required' })
    }

    let imageUrl = ''
    if (req.file) {
      imageUrl = await uploadFileToStorage(req.file)
    } else {
      imageUrl = req.body.image
    }

    const parsedTags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []

    const item = await prisma.gallery.create({
      data: {
        title,
        image: imageUrl,
        tags: parsedTags,
        category: category || 'Website'
      }
    })
    res.json({ success: true, item })
  } catch (error) {
    next(error)
  }
}

export async function updateGalleryItem(req, res, next) {
  const { title, tags, category } = req.body
  try {
    const item = await prisma.gallery.findUnique({ where: { id: req.params.id } })
    if (!item) return res.status(404).json({ error: 'Gallery item not found' })

    const updateData = {
      title: title || item.title,
      category: category || item.category,
      tags: tags !== undefined ? (Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []) : item.tags
    }

    if (req.file) {
      updateData.image = await uploadFileToStorage(req.file)
    } else if (req.body.image !== undefined) {
      updateData.image = req.body.image
    }

    const updatedItem = await prisma.gallery.update({ where: { id: item.id }, data: updateData })
    res.json({ success: true, item: updatedItem })
  } catch (error) {
    next(error)
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const item = await prisma.gallery.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!item) return res.status(404).json({ error: 'Gallery item not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 10. FAQs CRUD
export async function getFAQs(req, res, next) {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } })
    res.json(faqs)
  } catch (error) {
    next(error)
  }
}

export async function createFAQ(req, res, next) {
  const { question, answer, order } = req.body
  try {
    const faq = await prisma.fAQ.create({ data: { question, answer, order: order || 0 } })
    res.json({ success: true, faq })
  } catch (error) {
    next(error)
  }
}

export async function updateFAQ(req, res, next) {
  const { question, answer, order } = req.body
  try {
    const faq = await prisma.fAQ.findUnique({ where: { id: req.params.id } })
    if (!faq) return res.status(404).json({ error: 'FAQ not found' })

    const updateData = {
      question: question || faq.question,
      answer: answer || faq.answer,
      order: order !== undefined ? order : faq.order
    }

    const updatedFAQ = await prisma.fAQ.update({ where: { id: faq.id }, data: updateData })
    res.json({ success: true, faq: updatedFAQ })
  } catch (error) {
    next(error)
  }
}

export async function deleteFAQ(req, res, next) {
  try {
    const faq = await prisma.fAQ.delete({ where: { id: req.params.id } }).catch(() => null)
    if (!faq) return res.status(404).json({ error: 'FAQ not found' })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

// 11. WEBSITE SETTINGS CRUD
export async function getSettings(req, res, next) {
  try {
    let settings = await prisma.websiteSettings.findUnique({ where: { key: 'global_settings' } })
    if (!settings) {
      settings = await prisma.websiteSettings.create({ data: { key: 'global_settings' } })
    }
    res.json(settings)
  } catch (error) {
    next(error)
  }
}

export async function updateSettings(req, res, next) {
  const { siteName, seoTitle, seoDescription, seoKeywords, socialLinks, customContent } = req.body
  try {
    let settings = await prisma.websiteSettings.findUnique({ where: { key: 'global_settings' } })
    if (!settings) {
      settings = await prisma.websiteSettings.create({ data: { key: 'global_settings' } })
    }

    const updateData = {}
    if (siteName) updateData.siteName = siteName
    if (seoTitle) updateData.seoTitle = seoTitle
    if (seoDescription) updateData.seoDescription = seoDescription
    if (seoKeywords) updateData.seoKeywords = seoKeywords

    if (socialLinks) {
      updateData.socialLinks = {
        ...(settings.socialLinks || {}),
        ...socialLinks
      }
    }

    if (customContent) {
      updateData.customContent = {
        ...(settings.customContent || {}),
        ...customContent
      }
    }

    const updatedSettings = await prisma.websiteSettings.update({ where: { key: 'global_settings' }, data: updateData })
    res.json({ success: true, settings: updatedSettings })
  } catch (error) {
    next(error)
  }
}
