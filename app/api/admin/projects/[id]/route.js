import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updateData = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null
    if (body.package !== undefined) updateData.package = body.package
    if (body.paymentAmountTotal !== undefined) updateData.paymentAmountTotal = Number(body.paymentAmountTotal)
    if (body.paymentAmountPaid !== undefined) {
      updateData.paymentAmountPaid = Number(body.paymentAmountPaid)
      const total = updateData.paymentAmountTotal !== undefined ? updateData.paymentAmountTotal : undefined
      if (total !== undefined) {
        updateData.paymentStatus = updateData.paymentAmountPaid >= total ? 'Paid' : (updateData.paymentAmountPaid > 0 ? 'Partial' : 'Unpaid')
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, project: updated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
