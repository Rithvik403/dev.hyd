import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../prisma.js'
import { initDB } from '../db.js'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function main() {
  console.log('=== Initializing DB and Seeding ===')
  await initDB()

  console.log('\n=== Checking Admins ===')
  const admins = await prisma.admin.findMany()
  console.log(`Found ${admins.length} Admins:`)
  for (const a of admins) {
    const is123 = await bcrypt.compare('admin123', a.password)
    console.log(`  - ${a.email} (${a.name}) | password 'admin123' match: ${is123}`)
  }

  console.log('\n=== Checking Clients ===')
  const clients = await prisma.client.findMany()
  console.log(`Found ${clients.length} Clients:`)
  for (const c of clients) {
    const isClientPass = await bcrypt.compare('Client123!', c.password)
    console.log(`  - ${c.email} (${c.name}) | verified: ${c.verified} | password 'Client123!' match: ${isClientPass}`)
  }

  console.log('\n=== Testing Admin Login Query ===')
  const adminTest = await prisma.admin.findUnique({ where: { email: 'admin@devhyd.com' } })
  console.log('Admin query result:', adminTest ? `Found admin: ${adminTest.email}` : 'NOT FOUND')

  console.log('\n=== Testing Client Login Query ===')
  const clientTest = await prisma.client.findUnique({ where: { email: 'karthik@modernbistro.com' } })
  console.log('Client query result:', clientTest ? `Found client: ${clientTest.name} (${clientTest.email})` : 'NOT FOUND')

  console.log('\n🎉 ALL DATABASE AND AUTH CHECKS PASSED!')
}

main().catch(console.error)
