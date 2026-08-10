import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { emitSystemEvent, EVENTS } from '@/lib/eventEmitter'

export async function GET(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const messages = await prisma.message.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, text } = await request.json()
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        clientId: user.id,
        projectId: projectId || null,
        senderRole: user.role,
        text: text.trim()
      }
    })

    emitSystemEvent(EVENTS.MESSAGE_SENT, message, { userId: user.id, userRole: user.role })

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
