import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../data')
const dbFilePath = path.join(dataDir, 'local_db.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Generate seeded initial database
async function getInitialData() {
  const hashAdmin = await bcrypt.hash('admin123', 10)
  const hashRithvik = await bcrypt.hash('Rithvik@1909', 10)
  const hashClient = await bcrypt.hash('Client123!', 10)

  return {
    admins: [
      { id: 'adm-1', name: 'Dev.hyd Admin', email: 'dev.hyd.official@gmail.com', password: hashAdmin, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'adm-2', name: 'Admin', email: 'admin@devhyd.com', password: hashAdmin, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'adm-3', name: 'Rithvik Admin', email: 'neelamrithvik@gmail.com', password: hashRithvik, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    clients: [
      { id: 'cli-1', name: 'Karthik Reddy', email: 'karthik@modernbistro.com', phone: '+91 98765 43210', password: hashClient, verified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'cli-2', name: 'Anjali Verma', email: 'anjali@salonstudio.com', phone: '+91 98765 43211', password: hashClient, verified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'cli-3', name: 'Neha Kapoor', email: 'neha@boutique.com', phone: '+91 98765 43212', password: hashClient, verified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'cli-4', name: 'Dev Client', email: 'dev.hyd.official@gmail.com', phone: '+91 77802 52258', password: hashClient, verified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    projects: [
      {
        id: 'proj-1',
        clientId: 'cli-1',
        title: 'Modern Bistro Website',
        description: 'Modern, responsive food & beverage website with digital menu, location map, and instant WhatsApp booking.',
        status: 'Development',
        package: 'Premium Plan',
        deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
        paymentStatus: 'Partial',
        paymentAmountTotal: 15000,
        paymentAmountPaid: 5000,
        updates: [
          { status: 'Discovery', note: 'Project kickoff and requirements finalized', date: new Date(Date.now() - 3 * 86400000).toISOString() },
          { status: 'Design', note: 'UI/UX wireframes and branding aesthetics approved', date: new Date(Date.now() - 1 * 86400000).toISOString() }
        ],
        files: [
          { name: 'bistro-brand-guide.pdf', url: '/uploads/bistro-guide.pdf', size: 1024000, uploadedAt: new Date().toISOString() }
        ],
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'proj-2',
        clientId: 'cli-2',
        title: 'Luxury Salon Studio Portal',
        description: 'Booking system and high-aesthetic portfolio for Luxury Unisex Salon in Gowlidoddi.',
        status: 'Design',
        package: 'Business Website',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        paymentStatus: 'Paid',
        paymentAmountTotal: 8000,
        paymentAmountPaid: 8000,
        updates: [
          { status: 'Discovery', note: 'Domain registered and initial mockup created', date: new Date().toISOString() }
        ],
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    enquiries: [
      {
        id: 'enq-1',
        name: 'Rahul Sharma',
        business: 'FitZone Gym',
        phone: '+91 9988776655',
        email: 'rahul@fitzone.in',
        service: 'Business Website',
        budget: '₹5,000 - ₹10,000',
        message: 'Need a gym website with membership details and location in Financial District.',
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    blogPosts: [
      {
        id: 'blog-1',
        title: 'Why Every Local Business in Hyderabad Needs a Website',
        slug: 'why-local-business-needs-website',
        excerpt: 'Most customers search Google before visiting any shop. If you are not online, you are invisible to them.',
        content: `## The Reality in 2026\n\nOver 85% of people in Hyderabad search Google before visiting a local business. If your salon, boutique, or clinic doesn't have a website, you're losing customers every single day.\n\n## What a Website Does For You\n\n- **Gets found on Google** when someone searches "salon near Financial District"\n- **Builds trust** — customers feel more confident booking after seeing your services and prices online\n- **Works 24/7** — your website takes enquiries even while you sleep\n- **Beats competitors** who still rely only on word of mouth\n\n## How Much Does It Cost?\n\nA basic professional website starts at just ₹5,000 — less than one month's social media ad spend. And unlike ads, your website keeps working forever.\n\n## Ready to Get Started?\n\nI build websites for local businesses in Gowlidoddi, Nanakramguda and the Financial District area. Contact me today for a free demo in 2 days.`,
        author: 'Dev.hyd',
        published: true,
        cover: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    services: [
      { id: 'srv-1', title: 'Business Website', description: 'Clean, fast websites with your services, photos, location & WhatsApp booking button. Works perfectly on mobile.', price: 'From ₹5,000', icon: 'blue', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'srv-2', title: 'Online Store', description: 'Sell your products online with a catalog, WhatsApp order button, and payment options. Perfect for boutiques.', price: 'From ₹10,000', icon: 'orange', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'srv-3', title: 'Social Media Management', description: 'Regular posts, reels design & growth strategy for Instagram and Facebook. More followers = more customers.', price: '₹5,000/month', icon: 'red', order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'srv-4', title: 'Logo & Branding', description: 'Logo, color palette, visiting card design — everything to make your business look professional and trustworthy.', price: 'From ₹3,000', icon: 'orange-light', order: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    testimonials: [
      { id: 'tst-1', text: '"Rithvik understood exactly what I needed. My website helped my salon get so many new bookings!"', name: 'Anjali Verma', business: 'Luxury Salon', avatar: '/images/avatar-anjali.png', stars: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tst-2', text: '"Super professional and delivered on time. The website looks amazing and works perfectly."', name: 'Karthik Reddy', business: 'Modern Bistro', avatar: '/images/avatar-karthik.png', stars: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'tst-3', text: '"Great design, fast delivery and very supportive. Highly recommended!"', name: 'Neha Kapoor', business: 'Boutique Owner', avatar: '/images/avatar-neha.png', stars: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    faqs: [
      { id: 'faq-1', question: 'How long will it take to build my website?', answer: 'For most basic business websites, I deliver a fully functional demo within 2 days. The final launch usually takes 5 to 7 days.', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'faq-2', question: 'Will I be able to edit my website?', answer: 'Yes! I build websites with simple editing options or client portals where you can update text, services, photos, and menus yourself without coding.', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'faq-3', question: 'Do you provide domain and hosting?', answer: 'Yes, I can set up and manage high-speed hosting and domain registration for your business so you do not have to worry about technical details.', order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'faq-4', question: 'Can I see a demo before I pay?', answer: 'Yes. I can build an initial concept demo for your business in 2 days before you make any payment.', order: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    galleries: [
      { id: 'gal-1', title: 'Luxury Unisex Salon', image: '/images/portfolio-salon.png', tags: ['Website', 'Booking', 'Mobile'], category: 'Website', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'gal-2', title: 'Fashion & Ethnic Wear', image: '/images/portfolio-boutique.png', tags: ['Website', 'Gallery', 'Catalog'], category: 'Website', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'gal-3', title: 'Modern Bistro', image: '/images/portfolio-bistro.png', tags: ['Website', 'Menu', 'Location'], category: 'Website', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    websiteSettings: [
      {
        id: 'ws-1',
        key: 'global_settings',
        siteName: 'dev.hyd',
        seoTitle: 'dev.hyd — Web Development for Local Businesses in Hyderabad',
        seoDescription: 'Helping Hyderabad businesses get more customers with modern websites, WhatsApp bookings, and Google Search visibility.',
        seoKeywords: 'web design Hyderabad, local business website, salon website, restaurant website',
        socialLinks: { instagram: 'https://instagram.com', whatsapp: 'https://wa.me/917780252258' },
        customContent: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    messages: [
      { id: 'msg-1', clientId: 'cli-1', projectId: 'proj-1', senderRole: 'client', text: 'Hi Rithvik, the design looks fantastic! When can we launch?', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'msg-2', clientId: 'cli-1', projectId: 'proj-1', senderRole: 'admin', text: 'Hey Karthik, we are doing final QA and mobile testing. Launching tomorrow!', read: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    notifications: [
      { id: 'notif-1', clientId: 'cli-1', title: 'Milestone Update', message: 'Design milestone approved. Development in progress.', read: false, type: 'info', link: '/client/project/proj-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    payments: [
      { id: 'pay-1', projectId: 'proj-1', clientId: 'cli-1', label: 'Advance Payment (30%)', amountDue: 5000, amountPaid: 5000, status: 'paid', paidAt: new Date(Date.now() - 3 * 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'pay-2', projectId: 'proj-1', clientId: 'cli-1', label: 'Final Delivery Payment', amountDue: 10000, amountPaid: 0, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-2026-0001', projectId: 'proj-1', clientId: 'cli-1', amountTotal: 15000, amountTax: 0, amountDue: 10000, status: 'partial', items: [{ description: 'Modern Bistro Web App & Menu', amount: 15000 }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    activityLogs: []
  }
}

class LocalStore {
  constructor() {
    this.data = null
    this.loaded = false
  }

  async load() {
    if (this.loaded && this.data) return
    ensureDataDir()

    if (fs.existsSync(dbFilePath)) {
      try {
        const raw = fs.readFileSync(dbFilePath, 'utf8')
        this.data = JSON.parse(raw)
        this.loaded = true
        return
      } catch (err) {
        console.warn('⚠️ Could not parse existing local_db.json, re-initializing fresh:', err.message)
      }
    }

    this.data = await getInitialData()
    this.save()
    this.loaded = true
  }

  save() {
    try {
      ensureDataDir()
      fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (err) {
      console.error('⚠️ Failed saving local_db.json:', err.message)
    }
  }

  getModelData(collectionName) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = []
    }
    return this.data[collectionName]
  }

  // Model Factory helper
  createModelHandler(collectionName) {
    return {
      findUnique: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const where = args.where || {}
        return list.find(item => {
          return Object.entries(where).every(([key, val]) => {
            if (val === undefined) return true
            if (typeof val === 'string' && typeof item[key] === 'string') {
              return item[key].toLowerCase() === val.toLowerCase()
            }
            return item[key] === val
          })
        }) || null
      },

      findFirst: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const where = args.where || {}
        return list.find(item => {
          return Object.entries(where).every(([key, val]) => {
            if (val === undefined) return true
            if (typeof val === 'object' && val !== null) {
              if (val.gt !== undefined) return new Date(item[key]) > new Date(val.gt)
              if (val.lt !== undefined) return new Date(item[key]) < new Date(val.lt)
              if (val.gte !== undefined) return new Date(item[key]) >= new Date(val.gte)
              if (val.lte !== undefined) return new Date(item[key]) <= new Date(val.lte)
            }
            if (typeof val === 'string' && typeof item[key] === 'string') {
              return item[key].toLowerCase() === val.toLowerCase()
            }
            return item[key] === val
          })
        }) || null
      },

      findMany: async (args = {}) => {
        await this.load()
        let list = [...this.getModelData(collectionName)]
        const where = args.where || {}
        
        if (Object.keys(where).length > 0) {
          list = list.filter(item => {
            return Object.entries(where).every(([key, val]) => {
              if (val === undefined) return true
              if (typeof val === 'object' && val !== null) {
                if (val.gt !== undefined) return new Date(item[key]) > new Date(val.gt)
                if (val.lt !== undefined) return new Date(item[key]) < new Date(val.lt)
              }
              if (typeof val === 'string' && typeof item[key] === 'string') {
                return item[key].toLowerCase() === val.toLowerCase()
              }
              return item[key] === val
            })
          })
        }

        // Sorting
        if (args.orderBy) {
          const [orderKey, orderDir] = Object.entries(args.orderBy)[0] || ['createdAt', 'desc']
          list.sort((a, b) => {
            const valA = a[orderKey]
            const valB = b[orderKey]
            if (orderDir === 'asc') return valA > valB ? 1 : -1
            return valA < valB ? 1 : -1
          })
        }

        if (args.skip) list = list.slice(args.skip)
        if (args.take) list = list.slice(0, args.take)

        return list
      },

      create: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const id = args.data.id || crypto.randomUUID()
        const newItem = {
          id,
          ...args.data,
          createdAt: args.data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        list.push(newItem)
        this.save()
        return newItem
      },

      createMany: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const items = args.data || []
        const created = []
        for (const item of items) {
          const newItem = {
            id: item.id || crypto.randomUUID(),
            ...item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          list.push(newItem)
          created.push(newItem)
        }
        this.save()
        return { count: created.length }
      },

      update: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const where = args.where || {}
        const index = list.findIndex(item => {
          return Object.entries(where).every(([key, val]) => {
            if (typeof val === 'string' && typeof item[key] === 'string') {
              return item[key].toLowerCase() === val.toLowerCase()
            }
            return item[key] === val
          })
        })

        if (index === -1) {
          // If not found, create or return null
          return null
        }

        list[index] = {
          ...list[index],
          ...args.data,
          updatedAt: new Date().toISOString()
        }
        this.save()
        return list[index]
      },

      updateMany: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const where = args.where || {}
        let count = 0
        for (let i = 0; i < list.length; i++) {
          const match = Object.entries(where).every(([key, val]) => list[i][key] === val)
          if (match) {
            list[i] = { ...list[i], ...args.data, updatedAt: new Date().toISOString() }
            count++
          }
        }
        this.save()
        return { count }
      },

      delete: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const where = args.where || {}
        const index = list.findIndex(item => {
          return Object.entries(where).every(([key, val]) => item[key] === val)
        })
        if (index === -1) return null
        const deleted = list.splice(index, 1)[0]
        this.save()
        return deleted
      },

      deleteMany: async (args = {}) => {
        await this.load()
        const where = args.where || {}
        if (Object.keys(where).length === 0) {
          const count = (this.data[collectionName] || []).length
          this.data[collectionName] = []
          this.save()
          return { count }
        }
        const list = this.getModelData(collectionName)
        const initialLen = list.length
        this.data[collectionName] = list.filter(item => {
          return !Object.entries(where).every(([key, val]) => item[key] === val)
        })
        this.save()
        return { count: initialLen - this.data[collectionName].length }
      },

      count: async (args = {}) => {
        await this.load()
        const list = this.getModelData(collectionName)
        const where = args.where || {}
        if (Object.keys(where).length === 0) return list.length
        return list.filter(item => {
          return Object.entries(where).every(([key, val]) => item[key] === val)
        }).length
      }
    }
  }
}

export const localStore = new LocalStore()

export function getLocalDbClient() {
  return {
    admin: localStore.createModelHandler('admins'),
    client: localStore.createModelHandler('clients'),
    project: localStore.createModelHandler('projects'),
    blogPost: localStore.createModelHandler('blogPosts'),
    enquiry: localStore.createModelHandler('enquiries'),
    testimonial: localStore.createModelHandler('testimonials'),
    service: localStore.createModelHandler('services'),
    gallery: localStore.createModelHandler('galleries'),
    fAQ: localStore.createModelHandler('faqs'),
    websiteSettings: localStore.createModelHandler('websiteSettings'),
    message: localStore.createModelHandler('messages'),
    notification: localStore.createModelHandler('notifications'),
    payment: localStore.createModelHandler('payments'),
    invoice: localStore.createModelHandler('invoices'),
    activityLog: localStore.createModelHandler('activityLogs'),
    $connect: async () => { await localStore.load(); return true },
    $disconnect: async () => true,
    $transaction: async (fn) => {
      if (typeof fn === 'function') {
        return await fn(getLocalDbClient())
      }
      return true
    },
    $queryRaw: async () => [{ 1: 1 }]
  }
}
