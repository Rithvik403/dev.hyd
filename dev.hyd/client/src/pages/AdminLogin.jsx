import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { loginAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginAdmin(email, password)
      if (res.success) {
        toast.success('👑 Welcome back, Admin!')
        navigate('/admin')
      } else {
        setError(res.error || 'Invalid credentials')
        toast.error(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Authentication failed')
      toast.error('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-header">
          <Link to="/" className="logo">dev<span>.</span>hyd</Link>
          <div className="auth-badge">🔐 ADMIN CONTROL PORTAL</div>
          <h2>Administrator Login</h2>
          <p>Sign in to manage client projects, enquiries, and site content.</p>
        </div>

        {error && (
          <div className="form-error-banner" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label>Admin Email</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input 
                type="email" 
                placeholder="admin@devhyd.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoFocus 
              />
            </div>
          </div>

          <div className="form-field">
            <label>Master Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
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
            className="btn btn-primary btn-lg" 
            style={{ width: '100%', marginTop: '0.75rem', borderRadius: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : '🚀 Access Admin Dashboard'}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>•</span>
          <Link to="/client/login">Client Portal Login ↗</Link>
        </div>
      </div>
    </div>
  )
}
