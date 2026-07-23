import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('Verification token is missing.')
      return
    }

    authApi.verifyEmail(token)
      .then(() => {
        setSuccess(true)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to verify email. Token may be invalid or expired.')
        setLoading(false)
      })
  }, [token])

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ textAlign: 'center' }}>
        <Link to="/" className="logo" style={{ display: 'block', marginBottom: '1.5rem' }}>
          dev<span>.</span>hyd
        </Link>
        
        {loading ? (
          <div>
            <h2>Verifying Email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        ) : success ? (
          <div>
            <h2 style={{ color: 'var(--success)' }}>Verification Successful! 🎉</h2>
            <p style={{ margin: '1rem 0' }}>Your email has been verified. You can now log in to your dashboard.</p>
            <Link to="/client/login" className="btn btn-primary" style={{ width: '100%' }}>Go to Client Login</Link>
          </div>
        ) : (
          <div>
            <h2 style={{ color: 'var(--error)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--muted)', margin: '1rem 0' }}>{error}</p>
            <Link to="/" className="btn btn-outline" style={{ width: '100%' }}>Back to site</Link>
          </div>
        )}
      </div>
    </div>
  )
}
