import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
    }

    const [enquiries, clients, projects, blogPosts, services, testimonials, gallery, faqs, settings, payments] = await Promise.all([
      prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.client.findMany({
        include: {
          projects: true,
          invoices: true,
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.findMany({
        include: {
          client: true,
          payments: true
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.service.findMany({ orderBy: { order: 'asc' } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.gallery.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.fAQ.findMany({ orderBy: { order: 'asc' } }),
      prisma.websiteSettings.findFirst(),
      prisma.payment.findMany({ orderBy: { createdAt: 'desc' } })
    ])

    const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.paymentAmountPaid) || 0), 0)
    const pendingRevenue = projects.reduce((sum, p) => sum + (Math.max(0, Number(p.paymentAmountTotal) - Number(p.paymentAmountPaid)) || 0), 0)

    return NextResponse.json({
      metrics: {
        totalEnquiries: enquiries.length,
        newEnquiries: enquiries.filter(e => e.status === 'new').length,
        totalClients: clients.length,
        activeProjects: projects.filter(p => p.status !== 'Live' && p.status !== 'Completed').length,
        completedProjects: projects.filter(p => p.status === 'Live' || p.status === 'Completed').length,
        totalRevenue,
        pendingRevenue
      },
      enquiries,
      clients,
      projects,
      blogPosts,
      services,
      testimonials,
      gallery,
      faqs,
      settings: settings || {},
      payments
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
