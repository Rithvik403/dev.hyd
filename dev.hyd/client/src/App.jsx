import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Eager load primary landing page for instant paint
import Home from './pages/Home.jsx'

// Lazy load secondary routes & dashboards for optimal code splitting
const Blog = lazy(() => import('./pages/Blog.jsx'))
const Post = lazy(() => import('./pages/Post.jsx'))
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'))
const ClientLogin = lazy(() => import('./pages/ClientLogin.jsx'))
const ClientDashboard = lazy(() => import('./pages/ClientDashboard.jsx'))
const ClientProject = lazy(() => import('./pages/ClientProject.jsx'))
const ClientForm = lazy(() => import('./pages/ClientForm.jsx'))
const ProjectForm = lazy(() => import('./pages/ProjectForm.jsx'))
const BlogForm = lazy(() => import('./pages/BlogForm.jsx'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'))
const ProjectTracker = lazy(() => import('./pages/ProjectTracker.jsx'))

// Loading Fallback Component
function PageLoader() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(56, 189, 248, 0.2)',
        borderTopColor: '#38bdf8',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Loading Dev.hyd...</p>
    </div>
  )
}

// Route Title Management Helper
function DynamicTitleHandler() {
  const location = useLocation()

  useEffect(() => {
    const titles = {
      '/': 'Dev.hyd | Web Designer Hyderabad',
      '/blog': 'Blog & Insights | Dev.hyd',
      '/track-project': 'Track Your Project | Dev.hyd',
      '/admin/login': 'Admin Portal | Dev.hyd',
      '/admin': 'Admin Dashboard | Dev.hyd',
      '/client/login': 'Client Portal | Dev.hyd',
      '/client': 'Client Portal | Dev.hyd',
      '/legal/privacy': 'Privacy Policy | Dev.hyd',
      '/legal/terms': 'Terms of Service | Dev.hyd',
      '/legal/refund': 'Refund Policy | Dev.hyd'
    }

    const matchedTitle = titles[location.pathname] || 'Dev.hyd | Custom Web Design & Software'
    document.title = matchedTitle
  }, [location])

  return null
}

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
    <Suspense fallback={<PageLoader />}>
      <DynamicTitleHandler />
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
    </Suspense>
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
