import 'dotenv/config'
import prisma from '../prisma.js'

async function updateServicePrices() {
  try {
    console.log('🔄 Updating Database Service records to include SEO optimization...')

    await prisma.service.deleteMany({})

    const newServices = [
      {
        title: 'Business Website',
        description: 'Clean, fast business websites with services, photos, location, Google SEO optimization & WhatsApp booking button.',
        price: 'From ₹15,000',
        icon: 'blue'
      },
      {
        title: 'Custom Web Application',
        description: 'Interactive web software with database, user auth, API integrations & administrative dashboard.',
        price: 'From ₹35,000',
        icon: 'orange'
      },
      {
        title: 'E-Commerce Store',
        description: 'Online store with product catalog, shopping cart, instant Razorpay checkout & automated inventory.',
        price: 'From ₹28,000',
        icon: 'red'
      },
      {
        title: 'Mobile App (iOS / Android)',
        description: 'Cross-platform mobile apps, speed optimization, Core Web Vitals performance tuning & Google SEO.',
        price: 'From ₹45,000',
        icon: 'orange-light'
      }
    ]

    for (const s of newServices) {
      await prisma.service.create({ data: s })
    }

    console.log('✅ Services database updated with SEO details!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error updating services database:', err)
    process.exit(1)
  }
}

updateServicePrices()
