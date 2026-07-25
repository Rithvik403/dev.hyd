import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clientApi, paymentApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'

// ─── Payment Tab Sub-Component (needs own hooks) ────────────────────────────
function ProjectPaymentTab({ p, data, onRefresh }) {
  const pId = p.id || p._id
  const [projPayments, setProjPayments] = useState(null)
  const [pmtProcessing, setPmtProcessing] = useState(false)
  const [activeModalPmt, setActiveModalPmt] = useState(null)

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  useEffect(() => {
    if (!pId) return
    paymentApi.clientGetPayments(pId)
      .then(r => setProjPayments(r.data))
      .catch(() => setProjPayments([]))
  }, [pId])

  const loadRzpScript = () => new Promise(resolve => {
    if (document.getElementById('rzp-script')) return resolve(true)
    const s = document.createElement('script')
    s.id = 'rzp-script'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  const handlePayRazorpay = async (pmt) => {
    setPmtProcessing(pmt.id)
    try {
      const loaded = await loadRzpScript()
      if (!loaded) { toast.error('Payment gateway unavailable'); setPmtProcessing(false); return }

      const orderRes = await paymentApi.clientCreateOrder({ payment_id: pmt.id, project_id: pId })
      const { order_id, amount, currency, key, payment_id } = orderRes.data

      const options = {
        key, amount, currency,
        name: 'dev.hyd',
        description: pmt.label,
        order_id,
        prefill: { name: data?.client?.name || '', contact: data?.client?.phone || '' },
        theme: { color: '#FF4D00' },
        config: {
          display: {
            preferences: {
              show_default_blocks: true
            }
          }
        },
        handler: async (response) => {
          try {
            await paymentApi.clientVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id
            })
            setProjPayments(prev => prev.map(pp => pp.id === pmt.id ? { ...pp, status: 'paid', paidAt: new Date().toISOString() } : pp))
            toast.success('Payment Successful! ✅')
            setActiveModalPmt(null)
            onRefresh()
          } catch { toast.error('Verification failed. Contact support.') }
          setPmtProcessing(false)
        },
        modal: { ondismiss: () => { setPmtProcessing(false); toast('Payment cancelled') } }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
      setPmtProcessing(false)
    } catch (err) {
      setPmtProcessing(false)
      toast.error(err.response?.data?.error || 'Payment initiation failed')
    }
  }

  return (
    <div className="project-status-card" key={pId}>
      <h3>💳 Invoices & Payments</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Verify billing accounts and pending statements.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Project Value</div>
          <strong style={{ fontSize: '1.8rem', color: 'var(--ink)' }}>₹{(p.paymentAmountTotal || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: 600 }}>Amount Paid</div>
          <strong style={{ fontSize: '1.8rem', color: 'var(--success)' }}>₹{(p.paymentAmountPaid || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 600 }}>Due Balance</div>
          <strong style={{ fontSize: '1.8rem', color: 'var(--error)' }}>
            ₹{Math.max(0, (p.paymentAmountTotal || 0) - (p.paymentAmountPaid || 0)).toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      {projPayments === null ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading installments…</p>
      ) : projPayments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.25rem' }}>PAYMENT INSTALLMENTS</div>
          {projPayments.map((pmt, idx) => (
            <div key={pmt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', border: `1.5px solid ${pmt.status === 'paid' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', background: pmt.status === 'paid' ? '#f0fdf4' : '#fff7f7', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{idx + 1}. {pmt.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {pmt.status === 'paid' && pmt.paidAt ? `Paid on ${new Date(pmt.paidAt).toLocaleDateString('en-IN')}` : 'Due Now'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <strong style={{ fontSize: '1rem' }}>{formatINR(Number(pmt.amountDue))}</strong>
                {pmt.status === 'paid' ? (
                  <span style={{ background: '#16a34a', color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>✓ Paid</span>
                ) : (
                  <button
                    onClick={() => setActiveModalPmt(pmt)}
                    disabled={!!pmtProcessing}
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', background: 'var(--accent)', border: 'none' }}
                  >
                    {pmtProcessing === pmt.id ? '...' : 'Pay Now →'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Invoice Statement</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Ref: {p.package || 'Custom Website Development'}</span>
            </div>
            <span className={`badge ${p.paymentStatus}`}>{p.paymentStatus || 'Pending'}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.75rem' }}>No installment breakdown set yet. Your developer will add payment milestones soon.</p>
        </div>
      )}

      {/* GATEWAY PAYMENT MODAL */}
      {activeModalPmt && (
        <div className="pay-modal-backdrop" onClick={() => setActiveModalPmt(null)}>
          <div className="pay-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button type="button" className="modal-close-btn" onClick={() => setActiveModalPmt(null)}>×</button>

            <div className="pay-modal-head" style={{ marginBottom: '1.25rem' }}>
              <span className="pay-sub-tag">SECURE MILESTONE PAYMENT</span>
              <h2 style={{ fontSize: '1.7rem', margin: '0.2rem 0' }}>Pay {formatINR(Number(activeModalPmt.amountDue))}</h2>
              <p className="pay-for-text">Milestone: <strong>{activeModalPmt.label}</strong></p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Automated Payment Gateway</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Supports UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards & NetBanking with instant automated verification.
              </p>
              <button
                type="button"
                onClick={() => handlePayRazorpay(activeModalPmt)}
                disabled={pmtProcessing === activeModalPmt.id}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
              >
                {pmtProcessing === activeModalPmt.id ? 'Opening Gateway...' : `Pay ${formatINR(Number(activeModalPmt.amountDue))} via Razorpay →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClientDashboard({ onLogout }) {
  const { checkAuthStatus } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState('timeline') // timeline, chat, files, payments, profile
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Chat message state
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatSubmitting, setChatSubmitting] = useState(false)

  // File upload state
  const [fileToUpload, setFileToUpload] = useState(null)
  const [fileNameInput, setFileNameInput] = useState('')
  const [fileSubmitting, setFileSubmitting] = useState(false)

  // Profile Form state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const fetchClientDashboardData = () => {
    clientApi.getDashboard()
      .then(res => {
        setData(res.data)
        setMessages(res.data.messages || [])
        setProfileForm({
          name: res.data.client?.name || '',
          phone: res.data.client?.phone || ''
        })
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchClientDashboardData()
  }, [])

  const handleLogout = async () => {
    try {
      await clientApi.logout()
      onLogout()
      toast.success('Logged out')
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

  // Messaging handlers
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setChatSubmitting(true)

    try {
      const activeProj = data?.projects?.[0]
      const response = await clientApi.sendMessage({
        text: newMessage,
        project_id: activeProj ? (activeProj.id || activeProj._id) : null
      })
      setMessages(prev => [...prev, response.data.message])
      setNewMessage('')
      toast.success('Message sent')
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setChatSubmitting(false)
    }
  }

  // File upload handlers
  const handleFileUpload = async (e, projectId) => {
    e.preventDefault()
    if (!fileToUpload) return toast.error('Please select a file to upload')
    setFileSubmitting(true)

    const formData = new FormData()
    formData.append('file', fileToUpload)
    formData.append('name', fileNameInput || fileToUpload.name)

    toast.loading('Uploading file...')
    try {
      await clientApi.uploadFile(projectId, formData)
      toast.dismiss()
      toast.success('File uploaded successfully!')
      setFileToUpload(null)
      setFileNameInput('')
      fetchClientDashboardData()
    } catch (err) {
      toast.dismiss()
      toast.error('File upload failed')
    } finally {
      setFileSubmitting(false)
    }
  }

  // Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSubmitting(true)
    try {
      await clientApi.updateProfile(profileForm)
      toast.success('Profile updated successfully!')
      fetchClientDashboardData()
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setProfileSubmitting(false)
    }
  }

  // Mark notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      await clientApi.markNotificationsRead()
      fetchClientDashboardData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading || !preloaderDone) {
    return <Preloader subtitle="Client Portal" onFinish={() => setPreloaderDone(true)} />
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--error)' }}>Error: {error}</div>
  }

  const { client, projects, adminViewing, notifications } = data
  const unreadNotifications = notifications?.filter(n => !n.read) || []
  const stages = ['Discovery', 'Design', 'Development', 'Review', 'Delivered']

  return (
    <>
      {/* NAVBAR */}
      <nav>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
        <div className="nav-links">
          {adminViewing ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Admin Mode</span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Hi, {client.name}</span>
          )}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', marginLeft: '1.5rem' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* DASHBOARD WRAPPER */}
      <div className="client-layout">
        {adminViewing && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            <span>Viewing as Admin: <strong>{client.name} ({client.email})</strong></span>
            <button onClick={handleBackToAdmin} style={{ color: '#ef4444', background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}>
              Back to Admin
            </button>
          </div>
        )}

        {/* NOTIFICATIONS BAR */}
        {unreadNotifications.length > 0 && (
          <div style={{ background: 'rgba(255, 77, 0, 0.05)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>🔔 {unreadNotifications.length} New Alerts:</strong>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>{unreadNotifications[0].message}</p>
            </div>
            <button onClick={handleMarkNotificationsRead} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>
              Clear Notifications
            </button>
          </div>
        )}

        <div className="client-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>CLIENT DASHBOARD</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800 }}>My Portal</h1>
          </div>
        </div>

        {/* PORTAL NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
          <button onClick={() => setActiveSubTab('timeline')} className={`btn ${activeSubTab === 'timeline' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}>📈 Project Timeline</button>
          <button onClick={() => setActiveSubTab('chat')} className={`btn ${activeSubTab === 'chat' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}>💬 Messages</button>
          <button onClick={() => setActiveSubTab('files')} className={`btn ${activeSubTab === 'files' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}>📁 Files</button>
          <button onClick={() => setActiveSubTab('payments')} className={`btn ${activeSubTab === 'payments' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}>💳 Payments</button>
          <button onClick={() => setActiveSubTab('profile')} className={`btn ${activeSubTab === 'profile' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}>⚙️ Profile Settings</button>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <p>Your project hasn't started yet. We'll update this page once we kick off!</p>
            <Link to="/#contact" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Contact Me</Link>
          </div>
        ) : (
          <div>
            {/* ACTIVE PROJECT TIMELINE VIEW */}
            {activeSubTab === 'timeline' && projects.map(p => {
              const pId = p.id || p._id
              const idx = stages.indexOf(p.status)
              const pct = idx >= 0 ? Math.round(((idx + 1) / stages.length) * 100) : 0

              return (
                <div className="project-status-card" key={pId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3>{p.title}</h3>
                    <span className={`badge ${p.status}`}>{p.status}</span>
                  </div>
                  
                  <div className="project-meta">
                    <span>📦 {p.package || 'Custom'}</span>
                    {p.deadline && (
                      <span>📅 Deadline: {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                    <span>🗓 Started: {new Date(p.created_at || p.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  
                  {p.description && <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>{p.description}</p>}

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

                  {/* TIMELINE EVENTS */}
                  {p.updates && p.updates.length > 0 && (
                    <div className="updates-list" style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--muted)' }}>UPDATE HISTORY</div>
                      {[...p.updates].reverse().map((u, ui) => (
                        <div className="update-item" key={ui}>
                          <p><strong>{u.status}</strong>{u.note && ` — ${u.note}`}</p>
                          <time>{new Date(u.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* GOOGLE MEET & CREDENTIALS VAULT CARDS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                    
                    {/* Google Meet Card */}
                    <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#38BDF8', fontWeight: 700 }}>
                        <span>📹 DEDICATED 1-ON-1 GOOGLE MEET</span>
                      </div>
                      <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700 }}>Scheduled Client Review Call</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8' }}>Join live video call with Lead Developer for project demos, design reviews & Q&A.</p>
                      <a
                        href={p.meet_url || "https://meet.google.com/dev-hyd-client-call"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ background: '#2563EB', borderColor: '#2563EB', marginTop: '0.4rem', textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.84rem' }}
                      >
                        🎥 Join Google Meet Call ↗
                      </a>
                    </div>

                    {/* Credentials & Access Vault Card */}
                    <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700 }}>
                        🔑 PROJECT ACCESS & CREDENTIALS
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Staging & Production Portal</h4>
                      <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--muted)' }}>
                        <div>Staging URL: <strong style={{ color: 'var(--ink)' }}>{p.staging_url || 'https://staging.devhyd.com'}</strong></div>
                        <div>Portal Login Email: <strong style={{ color: 'var(--ink)' }}>{client.email}</strong></div>
                        <div>Password: <strong style={{ color: 'var(--ink)' }}>Sent to your Email ✉️</strong></div>
                      </div>
                      <a
                        href={p.staging_url || "https://staging.devhyd.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ marginTop: '0.4rem', textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.84rem' }}
                      >
                        🚀 Open Staging Preview Site ↗
                      </a>
                    </div>

                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link to={`/client/project/${pId}`} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>🔍 View Full Details</Link>
                    <a href="https://wa.me/917780252258" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>💬 WhatsApp Support</a>
                  </div>
                </div>
              )
            })}

            {/* CHAT MESSAGES PANEL */}
            {activeSubTab === 'chat' && (
              <div className="project-status-card">
                <h3>💬 Communication Room</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Message the administrator directly regarding revisions or updates.</p>
                
                {/* Chat Log */}
                <div style={{ height: '350px', overflowY: 'auto', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '1rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--muted)' }}>No messages yet. Send a greetings to kick off!</div>
                  ) : (
                    messages.map((m, idx) => {
                      const isAdmin = m.sender_role === 'admin'
                      return (
                        <div key={m._id || idx} style={{ alignSelf: isAdmin ? 'flex-start' : 'flex-end', background: isAdmin ? '#e9e9e9' : 'var(--accent-light)', color: isAdmin ? '#000' : 'var(--ink)', padding: '0.6rem 1rem', borderRadius: '12px', maxWidth: '75%', border: isAdmin ? '1px solid #ddd' : '1px solid rgba(255, 77, 0, 0.2)' }}>
                          <p style={{ margin: 0, fontSize: '0.88rem' }}>{m.text}</p>
                          <small style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', textAlign: 'right', marginTop: '0.2rem' }}>
                            {isAdmin ? 'Admin' : 'You'} • {new Date(m.created_at || new Date()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Send form */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    style={{ flex: 1, padding: '0.6rem 1rem', border: '1.5px solid var(--border)', borderRadius: '6px' }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }} disabled={chatSubmitting}>
                    {chatSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}

            {/* FILES WORKSPACE */}
            {activeSubTab === 'files' && projects.map(p => {
              const pId = p.id || p._id
              return (
                <div className="project-status-card" key={pId}>
                <h3>📁 Project Deliverables</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Download layouts, media assets, or code builds provided by Rithvik, or upload files directly.</p>

                {/* Upload Form */}
                <form onSubmit={(e) => handleFileUpload(e, pId)} style={{ background: '#fcfcfc', border: '1.5px dashed var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.85rem' }}>Upload Document/Asset</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Asset Display Name (e.g. Logo Vector)" 
                      value={fileNameInput} 
                      onChange={e => setFileNameInput(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                    />
                    <input 
                      type="file" 
                      onChange={e => setFileToUpload(e.target.files[0])}
                      style={{ fontSize: '0.82rem' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }} disabled={fileSubmitting}>
                    {fileSubmitting ? 'Uploading...' : 'Upload File'}
                  </button>
                </form>

                {/* Files List */}
                <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--muted)' }}>AVAILABLE DELIVERABLES ({p.files?.length || 0})</strong>
                {!p.files || p.files.length === 0 ? (
                  <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--muted)' }}>No files uploaded yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {p.files.map((file, idx) => (
                      <div key={file.id || file._id || idx} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{file.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Uploaded: {new Date(file.uploaded_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )
            })}

            {/* INVOICES / PAYMENTS TAB */}
            {activeSubTab === 'payments' && projects.map(p => (
              <ProjectPaymentTab key={p.id || p._id} p={p} data={data} onRefresh={fetchClientDashboardData} />
            ))}

            {/* PROFILE SETTINGS TAB */}
            {activeSubTab === 'profile' && (
              <div className="project-status-card">
                <h3>⚙️ Profile Settings</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Update your contact information.</p>

                <form onSubmit={handleProfileSubmit} style={{ maxWidth: '500px' }}>
                  <div className="form-field">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={profileForm.phone} 
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={profileSubmitting}>
                    {profileSubmitting ? 'Saving Changes...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* FOOTER */}
      <footer>
        <div>
          © 2026 dev.hyd — <Link to="/" style={{ color: 'var(--muted)' }}>Back to site</Link>
        </div>
      </footer>
    </>
  )
}
