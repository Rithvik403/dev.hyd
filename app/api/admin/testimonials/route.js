import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, text, business, avatar, stars } = await request.json()
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        text,
        business: business || null,
        avatar: avatar || '/images/avatar-default.png',
        stars: Number(stars) || 5
      }
    })
    return NextResponse.json({ success: true, testimonial }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
