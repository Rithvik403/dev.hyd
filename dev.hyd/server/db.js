import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from './prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config({ path: path.join(__dirname, '.env') })

export async function initDB() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL is not configured. Prisma will not connect until it is set.')
      return
    }

    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL via Prisma')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@devhyd.com'
    const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } })
    if (!existingAdmin) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
      await prisma.admin.create({
        data: {
          email: adminEmail,
          password: hash,
          name: 'Admin'
        }
      })
      console.log('✅ Admin seeded: ' + adminEmail)
    }

    const existingPost = await prisma.blogPost.findFirst({ where: { slug: 'why-local-business-needs-website' } })
    if (!existingPost) {
      await prisma.blogPost.create({
        data: {
          title: 'Why Every Local Business in Hyderabad Needs a Website',
          slug: 'why-local-business-needs-website',
          excerpt: 'Most customers search Google before visiting any shop. If you\'re not online, you\'re invisible to them.',
          content: `## The Reality in 2026

Over 85% of people in Hyderabad search Google before visiting a local business. If your salon, boutique, or clinic doesn't have a website, you're losing customers every single day.

## What a Website Does For You

- **Gets found on Google** when someone searches "salon near Financial District"
- **Builds trust** — customers feel more confident booking after seeing your services and prices online
- **Works 24/7** — your website takes enquiries even while you sleep
- **Beats competitors** who still rely only on word of mouth

## How Much Does It Cost?

A basic professional website starts at just ₹5,000 — less than one month's social media ad spend. And unlike ads, your website keeps working forever.

## Ready to Get Started?

I build websites for local businesses in Gowlidoddi, Nanakramguda and the Financial District area. [Contact me today](#contact) for a free demo in 2 days.`,
          author: 'Dev.hyd',
          published: true
        }
      })
      console.log('✅ Sample blog post seeded')
    }
  } catch (error) {
    console.error('⚠️ Database initialization warning:', error.message)
  }
}
