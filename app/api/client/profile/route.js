import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, phone } = await request.json()
    const updated = await prisma.client.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      }
    })

    return NextResponse.json({ success: true, client: updated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
