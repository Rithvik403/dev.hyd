import prisma from '../prisma.js'
import logger from '../utils/logger.js'
import fs from 'fs'
import path from 'path'

export async function runDatabaseBackup() {
  logger.info('📦 Starting PostgreSQL Database Snapshot Backup...')
  try {
    const [enquiries, clients, projects, payments, invoices, activityLogs, settings] = await Promise.all([
      prisma.enquiry.findMany(),
      prisma.client.findMany({ select: { id: true, name: true, email: true, phone: true, createdAt: true } }),
      prisma.project.findMany(),
      prisma.payment.findMany(),
      prisma.invoice.findMany(),
      prisma.activityLog.findMany({ take: 500, orderBy: { createdAt: 'desc' } }),
      prisma.websiteSettings.findMany()
    ])

    const snapshot = {
      timestamp: new Date().toISOString(),
      counts: {
        enquiries: enquiries.length,
        clients: clients.length,
        projects: projects.length,
        payments: payments.length,
        invoices: invoices.length,
        logs: activityLogs.length
      },
      data: { enquiries, clients, projects, payments, invoices, activityLogs, settings }
    }

    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filename = `db_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const filePath = path.join(backupDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2))

    logger.info(`✅ Backup created successfully at ${filePath}`)
    return { success: true, filePath, counts: snapshot.counts }
  } catch (err) {
    logger.error(`❌ Database backup failed: ${err.message}`)
    return { success: false, error: err.message }
  }
}

if (process.argv[1] && process.argv[1].includes('backup.js')) {
  runDatabaseBackup().then(() => process.exit(0))
}

export default { runDatabaseBackup }
