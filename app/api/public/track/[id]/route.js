import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { name: true, phone: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found with this tracking ID' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
