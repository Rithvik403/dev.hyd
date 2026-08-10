'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(allowedRole === 'admin' ? '/admin/login' : '/client/login')
      } else if (allowedRole && role !== allowedRole && role !== 'admin') {
        router.push(role === 'client' ? '/client/dashboard' : '/')
      }
    }
  }, [user, role, loading, allowedRole, router])

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card-wrapper" style={{ textAlign: 'center' }}>
          <h2>Authenticating...</h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  return children
}
