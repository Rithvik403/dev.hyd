import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { clientApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ClientProject({ onLogout }) {
  const { checkAuthStatus } = useAuth()
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    clientApi.getProjectDetails(id)
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }, [id])

  const handleLogout = async () => {
    try {
      await clientApi.logout()
      onLogout()
      toast.success('Logged out successfully')
      navigate('/client/login')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBackToAdmin = async () => {
    try {
      const response = await clientApi.backToAdmin()
      if (response.data.success) {
        await checkAuthStatus()
        toast.success('Returned to Admin Panel')
        navigate(response.data.redirect)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to return to admin panel')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading project details...</div>
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2 style={{ color: 'var(--error)' }}>Project Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{error || 'Unable to access the project details.'}</p>
        <Link to="/client" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    )
  }

  const { client, project, adminViewing } = data
  const stages = ['Discovery', 'Design', 'Development', 'Review', 'Delivered']
  const idx = stages.indexOf(project.status)
  const pct = idx >= 0 ? Math.round(((idx + 1) / stages.length) * 100) : 0

  return (
    <>
      <nav>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
        <div className="nav-links">
          {adminViewing ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Admin Mode</span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Hi, {client.name}</span>
          )}
          <Link to="/client">Dashboard</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', marginLeft: '1.5rem' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="client-layout">
        {adminViewing && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            <span>Viewing as Admin: <strong>{client.name} ({client.email})</strong></span>
            <button onClick={handleBackToAdmin} style={{ color: '#ef4444', background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}>
              Back to Admin
            </button>
          </div>
        )}

        <div className="client-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>PROJECT DETAIL</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, margin: 0 }}>{project.title}</h1>
          </div>
          <Link to="/client" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className="project-status-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3>{project.title}</h3>
            <span className={`badge ${project.status}`}>{project.status}</span>
          </div>
          
          <div className="project-meta">
            <span>📦 {project.package || 'Custom'}</span>
            {project.deadline && (
              <span>📅 Deadline: {new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            )}
            <span>🗓 Started: {new Date(project.created_at || project.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          
          {project.description && <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>{project.description}</p>}

          {/* PROGRESS */}
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Progress — {pct}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {stages.map((s, i) => (
              <div key={s} style={{ fontSize: '0.68rem', textAlign: 'center', color: i <= idx ? 'var(--accent)' : 'var(--muted)', fontWeight: i === idx ? 700 : 400 }}>
                {i <= idx ? '✓ ' : ''}{s}
              </div>
            ))}
          </div>

          {/* UPDATES */}
          {project.updates && project.updates.length > 0 && (
            <div className="updates-list" style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--muted)' }}>UPDATE HISTORY</div>
              {[...project.updates].reverse().map((u, ui) => (
                <div className="update-item" key={ui}>
                  <p><strong>{u.status}</strong>{u.note && ` — ${u.note}`}</p>
                  <time>
                    {new Date(u.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <a href="https://wa.me/917780252258" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">💬 WhatsApp Me</a>
          </div>
        </div>
      </div>
      
      <footer>
        <div>
          © 2026 dev.hyd — <Link to="/" style={{ color: 'var(--muted)' }}>Back to site</Link>
        </div>
      </footer>
    </>
  )
}
