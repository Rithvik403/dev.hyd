'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { loginClient } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginClient(email.trim(), password.trim())
      if (res.success) {
        toast.success('🎉 Welcome to your Client Portal!')
        router.push('/client/dashboard')
      } else {
        setError(res.error || 'Invalid email or password')
        toast.error(res.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Login failed')
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-header">
          <Link href="/" className="auth-logo">dev.hyd</Link>
          <div className="portal-badge client">💼 CLIENT WORKSPACE</div>
          <h2 className="auth-title">Client Portal Login</h2>
          <p className="auth-subtitle">Sign in to view real-time project milestones, download deliverables & chat with Rithvik.</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label>Registered Email</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input 
                type="email" 
                placeholder="e.g. anjali@salonstudio.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="username"
                required 
                autoFocus 
              />
            </div>
          </div>

          <div className="form-field">
            <label>Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                autoComplete="current-password"
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn client-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loader-text">
                <span className="spinner"></span> Connecting to Workspace...
              </span>
            ) : (
              '✨ Enter My Client Workspace →'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/forgot-password" className="auth-link">Forgot password?</Link>
          <span className="dot-sep">•</span>
          <Link href="/#contact" className="auth-link">Need a Website? Get Started 🚀</Link>
        </div>
      </div>
    </div>
  )
}

