import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const role = searchParams.get('role') || 'client'
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await authApi.resetPassword({ token, password, role })
      setMessage(response.data.message)
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin/login' : '/client/login')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <h2>Invalid Request</h2>
          <p style={{ color: 'var(--error)', margin: '1rem 0' }}>Reset token is missing.</p>
          <Link to="/" className="btn btn-outline">Back to site</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link to="/" className="logo" style={{ display: 'block', marginBottom: '1.5rem' }}>
          dev<span>.</span>hyd
        </Link>
        <h2>Reset Password</h2>
        <p>Enter your new password below</p>

        {error && <div className="error-msg">{error}</div>}
        {message && <div style={{ color: 'var(--success)', fontSize: '0.88rem', margin: '0.5rem 0', fontWeight: 600 }}>{message} — redirecting to login...</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoFocus 
            />
          </div>

          <div className="form-field">
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
