import 'dotenv/config'
import prisma from '../prisma.js'

async function updateTestimonialsInDB() {
  try {
    console.log('🔄 Updating Testimonial database records...')

    await prisma.testimonial.deleteMany({})

    const newTestimonials = [
      {
        name: 'Anjali Verma',
        business: 'Luxury Salon & Spa',
        text: 'Rithvik understood exactly what my business needed. The automated WhatsApp booking system he built helped our salon double our appointments within the first 2 weeks. Extremely professional and delivered right on time!',
        stars: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'Karthik Reddy',
        business: 'Modern Bistro & Cafe',
        text: 'The digital QR ordering menu built by dev.hyd transformed our dining experience. Customers love the instant mobile loading speed, and we saved thousands on menu reprinting costs.',
        stars: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'Neha Kapoor',
        business: 'Ethnic Wear Boutique',
        text: 'Super smooth e-commerce website with Razorpay payment gateway integration! Rithvik guided us through domain setup, product uploading, and Instagram shop integration. Highly recommended for any local retail business.',
        stars: 5,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
      }
    ]

    for (const t of newTestimonials) {
      await prisma.testimonial.create({ data: t })
    }

    console.log('✅ Testimonials database updated successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error updating testimonials database:', err)
    process.exit(1)
  }
}

updateTestimonialsInDB()
