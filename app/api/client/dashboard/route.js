import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || (user.role !== 'client' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized client access' }, { status: 401 })
    }

    const clientId = user.id
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        projects: {
          include: { payments: true, invoices: true },
          orderBy: { createdAt: 'desc' }
        },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
        payments: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client account not found' }, { status: 404 })
    }

    const unreadNotifications = client.notifications.filter(n => !n.read).length

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        verified: client.verified
      },
      projects: client.projects,
      activeProject: client.projects[0] || null,
      notifications: client.notifications,
      unreadNotifications,
      payments: client.payments,
      invoices: client.invoices,
      adminViewing: user.adminViewing || false
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
