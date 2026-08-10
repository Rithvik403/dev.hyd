import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { emitSystemEvent, EVENTS } from '@/lib/eventEmitter'

export async function POST(request) {
  try {
    const { name, phone, email, service, business, budget, message } = await request.json()

    if (!name || !phone || !service) {
      return NextResponse.json({ error: 'Name, phone, and service are required' }, { status: 400 })
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        service,
        business: business || null,
        budget: budget || null,
        message: message || null,
        status: 'new'
      }
    })

    emitSystemEvent(EVENTS.CONTACT_CREATED, enquiry, { userRole: 'public' })

    return NextResponse.json({ success: true, enquiry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
