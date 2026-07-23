import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ClientLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { loginClient } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginClient(email, password)
      if (res.success) {
        toast.success('🎉 Welcome to your Client Portal!')
        navigate('/client')
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
          <Link to="/" className="logo">dev<span>.</span>hyd</Link>
          <div className="auth-badge client-badge">📱 CLIENT WORKSPACE</div>
          <h2>Client Portal Login</h2>
          <p>Sign in to view real-time project milestones, download deliverables & chat with Rithvik.</p>
        </div>

        {error && (
          <div className="form-error-banner" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {error}
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
            {loading ? 'Opening Portal...' : '✨ Enter My Client Workspace →'}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>•</span>
          <Link to="/#contact">Need a Website? Get Started 🚀</Link>
        </div>
      </div>
    </div>
  )
}
