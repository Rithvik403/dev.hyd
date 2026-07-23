import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Import Pages
import Home from './pages/Home.jsx'
import Blog from './pages/Blog.jsx'
import Post from './pages/Post.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ClientLogin from './pages/ClientLogin.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'
import ClientProject from './pages/ClientProject.jsx'
import ClientForm from './pages/ClientForm.jsx'
import ProjectForm from './pages/ProjectForm.jsx'
import BlogForm from './pages/BlogForm.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import RefundPolicy from './pages/RefundPolicy.jsx'
import NotFound from './pages/NotFound.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'

import ProjectTracker from './pages/ProjectTracker.jsx'

function MainRoutes() {
  const { user, role, logout, setEmulatedClient } = useAuth()

  const handleAdminEmulateClient = (clientData) => {
    setEmulatedClient({
      id: clientData.id,
      name: clientData.name || 'Emulated Client',
      email: clientData.email || '',
      role: 'client'
    })
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Post />} />
      <Route path="/track-project" element={<ProjectTracker />} />
      
      {/* Legal Routes */}
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms" element={<Terms />} />
      <Route path="/legal/refund" element={<RefundPolicy />} />

      {/* Auth / Reset Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Login Routes */}
      <Route 
        path="/admin/login" 
        element={role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLogin />} 
      />
      <Route 
        path="/client/login" 
        element={role === 'client' ? <Navigate to="/client" replace /> : <ClientLogin />} 
      />
      <Route 
        path="/login" 
        element={role === 'client' ? <Navigate to="/client" replace /> : <ClientLogin />} 
      />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard onLogout={logout} onAdminEmulateClient={handleAdminEmulateClient} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/clients/new" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ClientForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/projects/new" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProjectForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/blog/new" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BlogForm />
          </ProtectedRoute>
        } 
      />

      {/* Protected Client Routes */}
      <Route 
        path="/client" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/project/:id" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientProject onLogout={logout} />
          </ProtectedRoute>
        } 
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainRoutes />
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: 'var(--ink)',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              fontFamily: 'sans-serif',
              fontSize: '0.88rem'
            }
          }}
        />
      </Router>
    </AuthProvider>
  )
}
