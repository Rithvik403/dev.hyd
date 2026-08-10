import { PrismaClient } from '@prisma/client'

const hosts = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-1-ap-south-1.pooler.supabase.com',
  'db.xmmrwzzmoiemhkhvquth.supabase.co'
]

const passwords = [
  'dev.hyd@2026',
  'dev.hyd@2025',
  'dev.hyd2026',
  'dev.hyd2025'
]

const ports = [5432, 6543]

async function testCombinations() {
  console.log('Testing Supabase combinations via Prisma...')

  for (const host of hosts) {
    for (const port of ports) {
      for (const pass of passwords) {
        const isDirect = host.startsWith('db.')
        const user = isDirect ? 'postgres' : 'postgres.xmmrwzzmoiemhkhvquth'
        const connStr = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres?connect_timeout=4`
        
        const prisma = new PrismaClient({
          datasources: { db: { url: connStr } }
        })

        try {
          await prisma.$connect()
          console.log(`\n🎉 SUCCESS! Connected with:`)
          console.log(`Host: ${host}, Port: ${port}, User: ${user}, Pass: ${pass}`)
          console.log(`Full connection string: ${connStr}\n`)
          await prisma.$disconnect()
          return
        } catch (err) {
          console.log(`❌ Failed [${host}:${port} / pass: ${pass}]: ${err.message.split('\n')[0]}`)
          await prisma.$disconnect().catch(() => {})
        }
      }
    }
  }
  console.log('All Supabase combinations failed.')
}

testCombinations()
