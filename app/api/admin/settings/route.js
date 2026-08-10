import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.websiteSettings.findFirst()
    return NextResponse.json(settings || {})
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const settings = await prisma.websiteSettings.upsert({
      where: { key: 'global_settings' },
      update: body,
      create: { key: 'global_settings', ...body }
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
