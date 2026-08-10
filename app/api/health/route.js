import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  let dbStatus = 'healthy'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    dbStatus = `fallback active: ${err.message}`
  }

  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js App Router',
    environment: process.env.NODE_ENV || 'production',
    database: dbStatus,
    timestamp: new Date().toISOString()
  })
}
