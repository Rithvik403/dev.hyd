import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, image, category, tags } = await request.json()
    const item = await prisma.gallery.create({
      data: {
        title,
        image,
        category: category || 'Website',
        tags: Array.isArray(tags) ? tags : []
      }
    })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
