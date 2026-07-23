import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Preloader from './Preloader'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    const subtitle = allowedRoles.includes('admin') ? 'Admin Control Center' : 'Client Portal'
    return <Preloader subtitle={subtitle} />
  }

  // Not logged in
  if (!user || !role) {
    const redirectPath = allowedRoles.includes('admin') ? '/admin/login' : '/client/login'
    return <Navigate to={redirectPath} replace />
  }

  // Role unauthorized
  if (!allowedRoles.includes(role)) {
    const fallbackPath = role === 'admin' ? '/admin' : '/client'
    return <Navigate to={fallbackPath} replace />
  }

  return children
}
