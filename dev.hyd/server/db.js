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

    // Ensure Admin accounts are seeded and ready for login
    const adminPass = (process.env.ADMIN_PASSWORD || 'admin123').trim()
    const adminAccounts = [
      { email: 'dev.hyd.official@gmail.com', name: 'Dev.hyd Admin', pass: adminPass },
      { email: 'admin@devhyd.com', name: 'Admin', pass: 'admin123' },
      { email: 'neelamrithvik@gmail.com', name: 'Rithvik Admin', pass: 'Rithvik@1909' }
    ]

    for (const acc of adminAccounts) {
      const cleanEmail = acc.email.trim().toLowerCase()
      const hash = await bcrypt.hash(acc.pass, 10)
      const existing = await prisma.admin.findUnique({ where: { email: cleanEmail } })
      if (!existing) {
        await prisma.admin.create({
          data: {
            email: cleanEmail,
            password: hash,
            name: acc.name
          }
        })
        console.log(`✅ Admin account seeded: ${cleanEmail}`)
      } else {
        // Ensure password is updated and matches
        await prisma.admin.update({
          where: { email: cleanEmail },
          data: { password: hash }
        })
      }
    }

    // Ensure Client accounts are seeded and ready for login
    const defaultClients = [
      { name: 'Anjali Verma', email: 'anjali@salonstudio.com', phone: '9876543210', pass: 'Client123!' },
      { name: 'Karthik Reddy', email: 'karthik@modernbistro.com', phone: '9876543211', pass: 'Client123!' },
      { name: 'Neha Kapoor', email: 'neha@boutique.com', phone: '9876543212', pass: 'Client123!' },
      { name: 'Dev Client', email: 'dev.hyd.official@gmail.com', phone: '7780252258', pass: 'Client123!' }
    ]

    for (const clientAcc of defaultClients) {
      const cleanEmail = clientAcc.email.trim().toLowerCase()
      const hash = await bcrypt.hash(clientAcc.pass, 10)
      const existing = await prisma.client.findUnique({ where: { email: cleanEmail } })
      if (!existing) {
        await prisma.client.create({
          data: {
            name: clientAcc.name,
            email: cleanEmail,
            phone: clientAcc.phone,
            password: hash,
            verified: true
          }
        })
        console.log(`✅ Default client account seeded: ${cleanEmail}`)
      } else {
        await prisma.client.update({
          where: { email: cleanEmail },
          data: { password: hash }
        })
      }
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
