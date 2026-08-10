import prisma from '../prisma.js'
import { emitSystemEvent, EVENTS } from '../events/eventEmitter.js'
import { sendProjectCreatedEmail } from '../emails/emailService.js'

export async function createProject(data) {
  const project = await prisma.project.create({
    data: {
      clientId: data.clientId,
      title: data.title,
      description: data.description || '',
      package: data.package || 'Custom',
      deadline: data.deadline ? new Date(data.deadline) : null,
      paymentAmountTotal: data.amountTotal ? parseFloat(data.amountTotal) : 0,
      status: data.status || 'Discovery',
      updates: [
        { status: data.status || 'Discovery', note: 'Project initialized', date: new Date() }
      ]
    },
    include: { client: true }
  })

  // Emit event
  emitSystemEvent(EVENTS.PROJECT_CREATED, {
    id: project.id,
    title: project.title,
    clientName: project.client.name,
    clientEmail: project.client.email,
    clientPhone: project.client.phone
  })

  // Send Project Created Email
  if (project.client?.email) {
    sendProjectCreatedEmail(project.client, project).catch(() => {})
  }

  return project
}

export async function updateProjectTimeline(projectId, status, note = '') {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true }
  })
  if (!project) throw new Error('Project not found')

  const isCompleted = status.toLowerCase() === 'completed' || status.toLowerCase() === 'delivered'
  const nextUpdates = [...(project.updates || []), { status, note, date: new Date() }]

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      updates: nextUpdates,
      ...(isCompleted ? { paymentStatus: 'Completed' } : {})
    }
  })

  const eventName = isCompleted ? EVENTS.PROJECT_COMPLETED : EVENTS.PROJECT_UPDATED
  emitSystemEvent(eventName, {
    id: updated.id,
    title: updated.title,
    status: updated.status,
    note,
    clientName: project.client?.name,
    clientEmail: project.client?.email,
    clientPhone: project.client?.phone
  })

  return updated
}

export default { createProject, updateProjectTimeline }
