import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cookieParser from 'cookie-parser'
import { initDB } from '../db.js'
import authRoutes from '../routes/auth.js'
import clientRoutes from '../routes/client.js'
import adminRoutes from '../routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

async function runTests() {
  console.log('--- Initializing DB ---')
  await initDB()

  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use('/api/auth', authRoutes)
  app.use('/api/client', clientRoutes)
  app.use('/api/admin', adminRoutes)

  const server = app.listen(4567, async () => {
    console.log('Test server listening on port 4567\n')

    try {
      // 1. Test Admin Login
      console.log('1. Testing Admin Login (admin@devhyd.com / admin123)...')
      const adminRes = await fetch('http://localhost:4567/api/auth/login/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@devhyd.com', password: 'admin123' })
      })
      const adminData = await adminRes.json()
      console.log(`Status: ${adminRes.status} | Success: ${adminData.success} | Role: ${adminData.user?.role} | Token: ${Boolean(adminData.token)}`)
      if (adminRes.status !== 200 || !adminData.success) throw new Error('Admin login failed')

      // 2. Test Admin Login with Wrong Password
      console.log('\n2. Testing Admin Login with wrong password...')
      const adminWrongRes = await fetch('http://localhost:4567/api/auth/login/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@devhyd.com', password: 'wrongpassword999' })
      })
      const adminWrongData = await adminWrongRes.json()
      console.log(`Status: ${adminWrongRes.status} | Error: ${adminWrongData.error}`)
      if (adminWrongRes.status !== 401) throw new Error('Admin invalid login did not reject')

      // 3. Test Client Login (karthik@modernbistro.com / Client123!)
      console.log('\n3. Testing Client Login (karthik@modernbistro.com / Client123!)...')
      const clientRes = await fetch('http://localhost:4567/api/auth/login/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'karthik@modernbistro.com', password: 'Client123!' })
      })
      const clientData = await clientRes.json()
      console.log(`Status: ${clientRes.status} | Success: ${clientData.success} | Name: ${clientData.user?.name} | Token: ${Boolean(clientData.token)}`)
      if (clientRes.status !== 200 || !clientData.success) throw new Error('Client login failed')

      // 4. Test Client Login with dev.hyd.official@gmail.com
      console.log('\n4. Testing Client Login (dev.hyd.official@gmail.com / Client123!)...')
      const client2Res = await fetch('http://localhost:4567/api/auth/login/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dev.hyd.official@gmail.com', password: 'Client123!' })
      })
      const client2Data = await client2Res.json()
      console.log(`Status: ${client2Res.status} | Success: ${client2Data.success} | User: ${client2Data.user?.email}`)
      if (client2Res.status !== 200 || !client2Data.success) throw new Error('Client2 login failed')

      // 5. Test Authenticated Client Route with Bearer Token
      console.log('\n5. Testing Authenticated Client Dashboard (/api/client/dashboard) with Bearer token...')
      const dashboardRes = await fetch('http://localhost:4567/api/client/dashboard', {
        headers: {
          'Authorization': `Bearer ${clientData.token}`
        }
      })
      const dashboardData = await dashboardRes.json()
      console.log(`Status: ${dashboardRes.status} | Client: ${dashboardData.client?.name} | Projects count: ${dashboardData.projects?.length}`)
      if (dashboardRes.status !== 200) throw new Error('Client dashboard authentication failed')

      // 6. Test Authenticated Admin Route with Bearer Token
      console.log('\n6. Testing Authenticated Admin Dashboard (/api/admin/dashboard) with Bearer token...')
      const adminDashRes = await fetch('http://localhost:4567/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${adminData.token}`
        }
      })
      const adminDashData = await adminDashRes.json()
      console.log(`Status: ${adminDashRes.status} | Stats Clients: ${adminDashData.stats?.totalClients} | Projects: ${adminDashData.stats?.totalProjects}`)
      if (adminDashRes.status !== 200) throw new Error('Admin dashboard authentication failed')

      // 7. Test /api/auth/me with Bearer Token
      console.log('\n7. Testing /api/auth/me endpoint...')
      const meRes = await fetch('http://localhost:4567/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${adminData.token}`
        }
      })
      const meData = await meRes.json()
      console.log(`Status: ${meRes.status} | Admin Email: ${meData.admin?.email}`)
      if (meRes.status !== 200 || !meData.admin) throw new Error('Auth Me endpoint failed')

      console.log('\n=============================================')
      console.log('🎉 ALL 7 AUTHENTICATION & LOGIN TESTS PASSED!')
      console.log('=============================================')
    } catch (err) {
      console.error('\n❌ TEST FAILED:', err.message)
    } finally {
      server.close()
      process.exit(0)
    }
  })
}

runTests().catch(console.error)
