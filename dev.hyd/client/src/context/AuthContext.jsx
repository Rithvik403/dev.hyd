import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [adminViewing, setAdminViewing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verify auth on mount
  const checkAuthStatus = async () => {
    try {
      const response = await authApi.getMe()
      const { admin, client, adminViewing } = response.data
      
      if (admin) {
        setUser(admin)
        setRole('admin')
        setAdminViewing(false)
      } else if (client) {
        setUser(client)
        setRole('client')
        setAdminViewing(adminViewing || false)
      } else {
        setUser(null)
        setRole(null)
        setAdminViewing(false)
      }
    } catch (err) {
      setUser(null)
      setRole(null)
      setAdminViewing(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Admin login handler
  const loginAdmin = async (email, password) => {
    setLoading(true)
    try {
      const response = await authApi.adminLogin({ email, password })
      if (response.data.success) {
        const adminUser = response.data.user
        setUser(adminUser)
        setRole('admin')
        setAdminViewing(false)
        return { success: true }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed'
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Client login handler
  const loginClient = async (email, password) => {
    setLoading(true)
    try {
      const response = await authApi.clientLogin({ email, password })
      if (response.data.success) {
        const clientUser = response.data.user
        setUser(clientUser)
        setRole('client')
        setAdminViewing(false)
        return { success: true }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed'
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Logout handler
  const logout = async () => {
    setLoading(true)
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setRole(null)
      setAdminViewing(false)
      setLoading(false)
    }
  }

  // Emulation set auth
  const setEmulatedClient = (clientData) => {
    setUser(clientData)
    setRole('client')
    setAdminViewing(true)
  }

  const value = {
    user,
    role,
    adminViewing,
    loading,
    loginAdmin,
    loginClient,
    logout,
    checkAuthStatus,
    setEmulatedClient
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
