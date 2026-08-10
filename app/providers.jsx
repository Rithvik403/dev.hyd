'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'

export function Providers({ children }) {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #334155',
            fontSize: '14px',
            fontWeight: 500
          }
        }}
      />
      {children}
    </AuthProvider>
  )
}

