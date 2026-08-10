'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
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
      <div className="auth-card-wrapper" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <Link href="/" className="auth-logo">dev.hyd</Link>
          <h2>Email Verification</h2>
        </div>

        {loading && (
          <div>
            <p>Verifying your email address, please wait...</p>
          </div>
        )}

        {success && (
          <div>
            <div style={{ color: 'var(--success)', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              ✓ Email Verified Successfully!
            </div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Your email has been confirmed. You can now log into your client portal.
            </p>
            <Link href="/client/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%' }}>
              Proceed to Login
            </Link>
          </div>
        )}

        {error && (
          <div>
            <div className="error-message" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
            <Link href="/client/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-card-wrapper"><h2>Verifying...</h2></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

