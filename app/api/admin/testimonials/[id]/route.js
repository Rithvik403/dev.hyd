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

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.text && { text: body.text }),
        ...(body.business !== undefined && { business: body.business }),
        ...(body.avatar && { avatar: body.avatar }),
        ...(body.stars !== undefined && { stars: Number(body.stars) })
      }
    })

    return NextResponse.json({ success: true, testimonial: updated })
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
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Testimonial deleted' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
