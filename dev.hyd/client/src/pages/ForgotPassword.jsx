import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('client')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await authApi.forgotPassword(email, role)
      const successMsg = response.data.message || 'Password reset link sent to your email!'
      setMessage(successMsg)
      toast.success(successMsg)
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send reset link'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-header">
          <Link to="/" className="logo">dev<span>.</span>hyd</Link>
          <div className="auth-badge">🔑 ACCOUNT RECOVERY</div>
          <h2>Forgot Password</h2>
          <p>Enter your email below to receive an instant password reset link.</p>
        </div>

        {error && (
          <div className="form-error-banner" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            ✅ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label>Registered Email</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input 
                type="email" 
                placeholder="e.g. name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoFocus 
              />
            </div>
          </div>
          
          <div className="form-field">
            <label>Account Type</label>
            <div className="input-with-icon">
              <span className="input-icon">🛡️</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="client">Client Portal Account</option>
                <option value="admin">Administrator Account</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%', marginTop: '0.75rem', borderRadius: '12px' }}
            disabled={loading}
          >
            {loading ? 'Sending Link...' : '✉️ Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link to="/client/login">Client Login</Link>
          <span>•</span>
          <Link to="/admin/login">Admin Login</Link>
        </div>
      </div>
    </div>
  )
}
