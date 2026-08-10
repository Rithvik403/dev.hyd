import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { emitSystemEvent, EVENTS } from '@/lib/eventEmitter'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId, title, description, package: pkg, deadline, totalAmount, paidAmount, status } = await request.json()
    if (!clientId || !title) {
      return NextResponse.json({ error: 'Client ID and title are required' }, { status: 400 })
    }

    const initialUpdates = [
      {
        date: new Date().toISOString(),
        status: status || 'Discovery',
        note: 'Project initialized and discovery phase commenced.'
      }
    ]

    const project = await prisma.project.create({
      data: {
        clientId,
        title,
        description: description || null,
        package: pkg || 'Custom Web Solution',
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'Discovery',
        paymentAmountTotal: totalAmount ? Number(totalAmount) : 0,
        paymentAmountPaid: paidAmount ? Number(paidAmount) : 0,
        paymentStatus: paidAmount && totalAmount && Number(paidAmount) >= Number(totalAmount) ? 'Paid' : (Number(paidAmount) > 0 ? 'Partial' : 'Unpaid'),
        updates: initialUpdates,
        files: []
      }
    })

    emitSystemEvent(EVENTS.PROJECT_CREATED, project, { userId: clientId, userRole: 'client' })

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
