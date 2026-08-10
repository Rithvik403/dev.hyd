import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { emitSystemEvent, EVENTS } from '@/lib/eventEmitter'

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, note } = await request.json()

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const currentUpdates = Array.isArray(project.updates) ? project.updates : []
    const newEntry = {
      date: new Date().toISOString(),
      status: status || project.status,
      note: note || `Status updated to ${status || project.status}`
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(status && { status }),
        updates: [newEntry, ...currentUpdates]
      }
    })

    // Create client notification
    await prisma.notification.create({
      data: {
        clientId: project.clientId,
        title: `Project Update: ${project.title}`,
        message: note || `Your project status is now ${status || project.status}`,
        type: 'project_update',
        link: `/client/project/${project.id}`
      }
    }).catch(() => {})

    emitSystemEvent(EVENTS.PROJECT_UPDATED, { projectId: id, status: status || project.status, note }, { userId: project.clientId, userRole: 'client' })

    return NextResponse.json({ success: true, project: updated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
