import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runMigration() {
  console.log('🏁 Starting Prisma migration script...')

  try {
    const dbJsonPath = path.join(__dirname, '../../data/db.json')
    const legacyData = fs.existsSync(dbJsonPath)
      ? JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'))
      : { admins: [], clients: [], projects: [], enquiries: [], blog_posts: [] }

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({})
      await tx.message.deleteMany({})
      await tx.notification.deleteMany({})
      await tx.project.deleteMany({})
      await tx.client.deleteMany({})
      await tx.admin.deleteMany({})
      await tx.blogPost.deleteMany({})
      await tx.enquiry.deleteMany({})
      await tx.testimonial.deleteMany({})
      await tx.service.deleteMany({})
      await tx.fAQ.deleteMany({})
      await tx.gallery.deleteMany({})
      await tx.websiteSettings.deleteMany({})
    })

    console.log('🧹 Cleared existing Prisma data')

    const admins = legacyData.admins || []
    if (admins.length === 0) {
      await prisma.admin.create({
        data: {
          name: 'Admin',
          email: process.env.ADMIN_EMAIL || 'admin@devhyd.com',
          password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
        }
      })
    } else {
      for (const legacyAdmin of admins) {
        await prisma.admin.create({
          data: {
            name: legacyAdmin.name || 'Admin',
            email: legacyAdmin.email,
            password: legacyAdmin.password
          }
        })
      }
    }

    const clients = legacyData.clients || []
    const createdClientIds = []
    for (const legacyClient of clients) {
      const created = await prisma.client.create({
        data: {
          name: legacyClient.name,
          email: legacyClient.email,
          phone: legacyClient.phone,
          password: legacyClient.password || await bcrypt.hash('changeme123', 10),
          verified: true
        }
      })
      createdClientIds.push(created.id)
    }

    const projects = legacyData.projects || []
    for (const legacyProject of projects) {
      const clientIndex = clients.findIndex((item) => item.id === legacyProject.client_id)
      if (clientIndex === -1) {
        continue
      }
      await prisma.project.create({
        data: {
          clientId: createdClientIds[clientIndex],
          title: legacyProject.title,
          description: legacyProject.description,
          status: legacyProject.status || 'Discovery',
          deadline: legacyProject.deadline ? new Date(legacyProject.deadline) : null,
          package: legacyProject.package,
          updates: legacyProject.updates || [],
          files: legacyProject.files || [],
          paymentStatus: legacyProject.payment_status || 'Unpaid',
          paymentAmountTotal: Number(legacyProject.payment_amount_total || 0),
          paymentAmountPaid: Number(legacyProject.payment_amount_paid || 0)
        }
      })
    }

    const enquiries = legacyData.enquiries || []
    for (const legacyEnquiry of enquiries) {
      await prisma.enquiry.create({
        data: {
          name: legacyEnquiry.name,
          business: legacyEnquiry.business,
          phone: legacyEnquiry.phone,
          email: legacyEnquiry.email,
          service: legacyEnquiry.service,
          budget: legacyEnquiry.budget,
          message: legacyEnquiry.message,
          status: legacyEnquiry.status || 'new'
        }
      })
    }

    const blogPosts = legacyData.blog_posts || []
    if (blogPosts.length === 0) {
      await prisma.blogPost.create({
        data: {
          title: 'Why Every Local Business in Hyderabad Needs a Website',
          slug: 'why-local-business-needs-website',
          excerpt: 'Most customers search Google before visiting any shop. If you\'re not online, you\'re invisible to them.',
          content: 'A polished website can transform local trust and enquiries.',
          author: 'Dev.hyd',
          published: true
        }
      })
    } else {
      for (const legacyPost of blogPosts) {
        await prisma.blogPost.create({
          data: {
            title: legacyPost.title,
            slug: legacyPost.slug,
            excerpt: legacyPost.excerpt,
            content: legacyPost.content,
            author: legacyPost.author || 'Dev.hyd',
            published: legacyPost.published || false,
            cover: legacyPost.cover || ''
          }
        })
      }
    }

    const defaultServices = [
      {
        title: 'Business Website',
        description: 'Clean, fast websites with your services, photos, location & WhatsApp booking button. Works perfectly on mobile.',
        price: 'From ₹5,000',
        icon: 'blue',
        order: 1
      },
      {
        title: 'Online Store',
        description: 'Sell your products online with a catalog, WhatsApp order button, and payment options. Perfect for boutiques.',
        price: 'From ₹10,000',
        icon: 'orange',
        order: 2
      },
      {
        title: 'Social Media Management',
        description: 'Regular posts, reels design & growth strategy for Instagram and Facebook. More followers = more customers.',
        price: '₹5,000/month',
        icon: 'red',
        order: 3
      },
      {
        title: 'Logo & Branding',
        description: 'Logo, color palette, visiting card design — everything to make your business look professional and trustworthy.',
        price: 'From ₹3,000',
        icon: 'orange-light',
        order: 4
      }
    ]
    await prisma.service.createMany({ data: defaultServices })

    const defaultTestimonials = [
      {
        text: '"Rithvik understood exactly what I needed. My website helped my salon get so many new bookings!"',
        name: 'Anjali Verma',
        business: 'Luxury Salon',
        avatar: '/images/avatar-anjali.png',
        stars: 5
      },
      {
        text: '"Super professional and delivered on time. The website looks amazing and works perfectly."',
        name: 'Karthik Reddy',
        business: 'Modern Bistro',
        avatar: '/images/avatar-karthik.png',
        stars: 5
      },
      {
        text: '"Great design, fast delivery and very supportive. Highly recommended!"',
        name: 'Neha Kapoor',
        business: 'Boutique Owner',
        avatar: '/images/avatar-neha.png',
        stars: 5
      }
    ]
    await prisma.testimonial.createMany({ data: defaultTestimonials })

    const defaultFAQs = [
      {
        question: 'How long will it take to build my website?',
        answer: 'For most basic business websites, I deliver a fully functional demo within 2 days. The final launch usually takes 5 to 7 days, depending on content availability and revisions.',
        order: 1
      },
      {
        question: 'Will I be able to edit my website?',
        answer: 'Yes! I build websites with simple editing options or client portals where you can update text, services, photos, and menus yourself without coding.',
        order: 2
      },
      {
        question: 'Do you provide domain and hosting?',
        answer: 'Yes, I can set up and manage high-speed hosting and domain registration (like .in or .com) for your business so you don\'t have to worry about the technical details.',
        order: 3
      },
      {
        question: 'Do you provide support after website launch?',
        answer: 'Absolutely! I offer support packages (with standard packages including 1-3 months of free support) to ensure your website runs smoothly and gets regular updates.',
        order: 4
      },
      {
        question: 'Can I see a demo before I pay?',
        answer: 'Yes. I believe in proving value upfront. I can build a basic initial concept demo for your business in 2 days before you make any payment.',
        order: 5
      }
    ]
    await prisma.fAQ.createMany({ data: defaultFAQs })

    const defaultGallery = [
      {
        title: 'Luxury Unisex Salon',
        image: '/images/portfolio-salon.png',
        tags: ['Website', 'Booking', 'Mobile'],
        category: 'Website'
      },
      {
        title: 'Fashion & Ethnic Wear',
        image: '/images/portfolio-boutique.png',
        tags: ['Website', 'Gallery', 'Catalog'],
        category: 'Website'
      },
      {
        title: 'Modern Bistro',
        image: '/images/portfolio-bistro.png',
        tags: ['Website', 'Menu', 'Location'],
        category: 'Website'
      }
    ]
    await prisma.gallery.createMany({ data: defaultGallery })

    await prisma.websiteSettings.create({
      data: {
        key: 'global_settings',
        siteName: 'dev',
        seoTitle: 'dev.hyd — Web Development for Local Businesses in Hyderabad',
        seoDescription: 'Helping Hyderabad businesses get more customers with modern websites, WhatsApp bookings, and Google Search visibility.',
        seoKeywords: 'web design Hyderabad, local business website, salon website, restaurant website',
        socialLinks: { instagram: 'https://instagram.com', whatsapp: 'https://wa.me/917780252258' },
        customContent: {}
      }
    })

    console.log('🏁 Migration complete')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
