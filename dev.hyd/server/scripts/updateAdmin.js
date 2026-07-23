import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'

async function updateAdminCredentials() {
  const adminAccounts = [
    { email: 'dev.hyd.official@gmail.com', name: 'Dev.hyd Admin', pass: 'admin123' },
    { email: 'neelamrithvik@gmail.com', name: 'Rithvik Admin', pass: 'Rithvik@1909' },
    { email: 'admin@devhyd.com', name: 'Admin', pass: 'admin123' }
  ]

  try {
    console.log('🔄 Seeding / Resetting Admin Credentials in Database...')

    for (const acc of adminAccounts) {
      const cleanEmail = acc.email.trim().toLowerCase()
      const hashedPassword = await bcrypt.hash(acc.pass, 10)
      
      const existing = await prisma.admin.findUnique({ where: { email: cleanEmail } })
      if (existing) {
        await prisma.admin.update({
          where: { email: cleanEmail },
          data: { password: hashedPassword }
        })
        console.log(`✅ Password updated for admin: ${cleanEmail}`)
      } else {
        await prisma.admin.create({
          data: {
            name: acc.name,
            email: cleanEmail,
            password: hashedPassword
          }
        })
        console.log(`✅ Created admin: ${cleanEmail}`)
      }
    }

    console.log('🎉 Admin credentials sync completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error)
    process.exit(1)
  }
}

updateAdminCredentials()
