import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    let [services, testimonials, blogPosts, gallery, faqs, settings] = await Promise.allSettled([
      prisma.service.findMany({ orderBy: { order: 'asc' } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
      prisma.gallery.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
      prisma.fAQ.findMany({ orderBy: { order: 'asc' } }),
      prisma.websiteSettings.findFirst()
    ])

    return NextResponse.json({
      services: services.status === 'fulfilled' ? services.value : [],
      testimonials: testimonials.status === 'fulfilled' ? testimonials.value : [],
      blogPosts: blogPosts.status === 'fulfilled' ? blogPosts.value : [],
      gallery: gallery.status === 'fulfilled' ? gallery.value : [],
      faqs: faqs.status === 'fulfilled' ? faqs.value : [],
      settings: settings.status === 'fulfilled' ? settings.value : {}
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
