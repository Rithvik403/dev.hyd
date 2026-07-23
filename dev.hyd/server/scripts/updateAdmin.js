import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'

async function updateAdminCredentials() {
  const newEmail = 'neelamrithvik@gmail.com'
  const rawPassword = 'Rithvik@1909'

  try {
    console.log('🔄 Updating Admin Credentials in Database...')
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    // Delete any old admin records or update existing
    await prisma.admin.deleteMany({})

    const admin = await prisma.admin.create({
      data: {
        name: 'Rithvik (Admin)',
        email: newEmail,
        password: hashedPassword
      }
    })

    console.log('✅ Admin credentials updated successfully!')
    console.log(`👤 Name: ${admin.name}`)
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password set to: ${rawPassword}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error)
    process.exit(1)
  }
}

updateAdminCredentials()
