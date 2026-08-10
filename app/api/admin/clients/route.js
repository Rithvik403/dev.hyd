import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { emitSystemEvent, EVENTS } from '@/lib/eventEmitter'

export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, phone, password, sendWelcomeEmail } = await request.json()
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const existing = await prisma.client.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return NextResponse.json({ error: 'A client with this email already exists' }, { status: 400 })
    }

    const rawPassword = password || 'Client123!'
    const hash = await bcrypt.hash(rawPassword, 10)

    const client = await prisma.client.create({
      data: {
        name,
        email: cleanEmail,
        phone: phone || null,
        password: hash,
        verified: true
      }
    })

    emitSystemEvent(EVENTS.CLIENT_CREATED, client, { userId: client.id, userRole: 'client' })

    return NextResponse.json({ success: true, client, generatedPassword: rawPassword }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
