import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, price, icon, order } = await request.json()
    const service = await prisma.service.create({
      data: {
        title,
        description: description || null,
        price,
        icon: icon || 'blue',
        order: Number(order) || 0
      }
    })
    return NextResponse.json({ success: true, service }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
