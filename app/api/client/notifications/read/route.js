import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.notification.updateMany({
      where: { clientId: user.id, read: false },
      data: { read: true }
    })

    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
