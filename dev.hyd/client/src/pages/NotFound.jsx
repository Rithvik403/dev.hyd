import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: '#ffffff', color: '#0f172a', padding: '3rem 2.5rem', borderRadius: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <span style={{ display: 'inline-block', padding: '0.35rem 0.85rem', background: '#fff5f0', color: '#ff5500', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>
          404 ERROR
        </span>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
          Page Not Found 🔍
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          The page you are looking for might have been moved or does not exist. Let's get you back on track!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/" style={{ padding: '0.85rem 1.5rem', background: '#ff5500', color: '#ffffff', textDecoration: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem' }}>
            🏠 Return to Homepage
          </Link>
          <Link to="/track-project" style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#334155', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.88rem' }}>
            🚀 Track Project Status
          </Link>
          <Link to="/client/login" style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#64748b', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem' }}>
            👤 Client Portal Login
          </Link>
        </div>
      </div>
    </div>
  )
}
