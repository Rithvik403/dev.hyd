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

    const updated = await prisma.gallery.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.image && { image: body.image }),
        ...(body.category && { category: body.category }),
        ...(body.tags && { tags: Array.isArray(body.tags) ? body.tags : [] })
      }
    })

    return NextResponse.json({ success: true, item: updated })
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
    await prisma.gallery.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Item deleted' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
