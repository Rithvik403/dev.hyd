import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'

async function testAllLogins() {
  console.log('--- TESTING ADMIN LOGINS ---')
  const adminTestCases = [
    { email: 'dev.hyd.official@gmail.com', pass: 'admin123' },
    { email: 'admin@devhyd.com', pass: 'admin123' },
    { email: 'neelamrithvik@gmail.com', pass: 'Rithvik@1909' }
  ]

  for (const tc of adminTestCases) {
    const admin = await prisma.admin.findUnique({ where: { email: tc.email } })
    if (!admin) {
      console.log(`❌ Admin not found: ${tc.email}`)
      continue
    }
    const match = await bcrypt.compare(tc.pass, admin.password)
    console.log(`[Admin] ${tc.email} -> Password Match (${tc.pass}): ${match ? '✅ SUCCESS' : '❌ FAILED'}`)
  }

  console.log('\n--- TESTING CLIENT LOGINS ---')
  const clientTestCases = [
    { email: 'anjali@salonstudio.com', pass: 'Client123!' },
    { email: 'karthik@modernbistro.com', pass: 'Client123!' },
    { email: 'neha@boutique.com', pass: 'Client123!' },
    { email: 'dev.hyd.official@gmail.com', pass: 'Client123!' }
  ]

  for (const tc of clientTestCases) {
    const client = await prisma.client.findUnique({ where: { email: tc.email } })
    if (!client) {
      console.log(`❌ Client not found: ${tc.email}`)
      continue
    }
    const match = await bcrypt.compare(tc.pass, client.password)
    console.log(`[Client] ${tc.email} -> Password Match (${tc.pass}): ${match ? '✅ SUCCESS' : '❌ FAILED'}`)
  }

  process.exit(0)
}

testAllLogins()
