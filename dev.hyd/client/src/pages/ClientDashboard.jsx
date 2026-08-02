import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clientApi, paymentApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Preloader from '../components/Preloader'

// ─── Payment Tab Sub-Component ──────────────────────────────────────────────
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
        theme: { color: '#f95721' },
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
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#0f172a' }}>💳 Invoices & Payments</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Verify billing accounts and pending statements for <strong>{p.title}</strong>.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Project Value</div>
          <strong style={{ fontSize: '1.8rem', color: '#0f172a' }}>₹{(p.paymentAmountTotal || 15000).toLocaleString('en-IN')}</strong>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', fontWeight: 600 }}>Amount Paid</div>
          <strong style={{ fontSize: '1.8rem', color: '#16a34a' }}>₹{(p.paymentAmountPaid || 3000).toLocaleString('en-IN')}</strong>
        </div>
        <div style={{ background: '#fff5f0', border: '1px solid #ffe0d1', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#c2410c', textTransform: 'uppercase', fontWeight: 600 }}>Due Balance</div>
          <strong style={{ fontSize: '1.8rem', color: '#f95721' }}>
            ₹{Math.max(0, (p.paymentAmountTotal || 15000) - (p.paymentAmountPaid || 3000)).toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      {projPayments === null ? (
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading installments…</p>
      ) : projPayments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>PAYMENT INSTALLMENTS</div>
          {projPayments.map((pmt, idx) => (
            <div key={pmt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', border: `1.5px solid ${pmt.status === 'paid' ? '#bbf7d0' : '#ffe0d1'}`, borderRadius: '10px', background: pmt.status === 'paid' ? '#f0fdf4' : '#fff5f0', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{idx + 1}. {pmt.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {pmt.status === 'paid' && pmt.paidAt ? `Paid on ${new Date(pmt.paidAt).toLocaleDateString('en-IN')}` : 'Due Now'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{formatINR(Number(pmt.amountDue))}</strong>
                {pmt.status === 'paid' ? (
                  <span style={{ background: '#16a34a', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>✓ Paid</span>
                ) : (
                  <button
                    onClick={() => setActiveModalPmt(pmt)}
                    disabled={!!pmtProcessing}
                    style={{ padding: '0.4rem 1.1rem', fontSize: '0.82rem', background: '#f95721', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {pmtProcessing === pmt.id ? '...' : 'Pay Now →'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Invoice Statement</strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>Ref: {p.package || 'Premium Plan'}</span>
            </div>
            <span style={{ background: '#fff0eb', color: '#f95721', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{p.paymentStatus || 'Pending'}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.75rem' }}>No installment breakdown set yet. Your developer will add payment milestones soon.</p>
        </div>
      )}

      {/* GATEWAY PAYMENT MODAL */}
      {activeModalPmt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setActiveModalPmt(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '2rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <button type="button" onClick={() => setActiveModalPmt(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}>×</button>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f95721', letterSpacing: '0.05em' }}>SECURE PAYMENT GATEWAY</span>
              <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0.4rem 0' }}>Pay {formatINR(Number(activeModalPmt.amountDue))}</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Milestone: <strong>{activeModalPmt.label}</strong></p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Razorpay Automated Checkout</p>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Supports UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards & NetBanking.
              </p>
              <button
                type="button"
                onClick={() => handlePayRazorpay(activeModalPmt)}
                disabled={pmtProcessing === activeModalPmt.id}
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem', background: '#f95721', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249, 87, 33, 0.3)' }}
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
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
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

  const handleMarkNotificationsRead = async () => {
    try {
      await clientApi.markNotificationsRead()
      fetchClientDashboardData()
      setShowNotifications(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopyText = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (loading || !preloaderDone) {
    return <Preloader subtitle="Client Portal" onFinish={() => setPreloaderDone(true)} />
  }

  if (error) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <h2>Error loading portal: {error}</h2>
        <button onClick={fetchClientDashboardData} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Retry</button>
      </div>
    )
  }

  const { client, projects, adminViewing, notifications } = data
  const unreadNotifications = notifications?.filter(n => !n.read) || []
  const activeProject = projects?.[0] || {
    id: 'bistro',
    title: 'Modern Bistro Website',
    package: 'Premium Plan',
    status: 'Design',
    paymentAmountTotal: 15000,
    paymentAmountPaid: 3000,
    createdAt: '2026-07-24',
    deadline: '2026-08-12',
    staging_url: 'https://staging.devhyd.com',
    meet_url: 'https://meet.google.com/dev-hyd-client-call'
  }

  // Get user initials for avatar
  const clientName = client?.name || 'Karthik Reddy'
  const initials = clientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'KR'

  // Stepper Stage Calculation
  const timelineStages = [
    { title: 'Discovery', statusText: 'Completed', date: '24 Jul 2026' },
    { title: 'Design', statusText: 'In Progress', date: '26 Jul 2026' },
    { title: 'Development', statusText: 'Pending', date: '-' },
    { title: 'Review', statusText: 'Pending', date: '-' },
    { title: 'Delivery', statusText: 'Pending', date: '-' }
  ]

  const currentStatus = activeProject.status || 'Design'
  let currentStageIndex = 1
  if (currentStatus === 'Discovery') currentStageIndex = 0
  else if (currentStatus === 'Design' || currentStatus === 'In Progress') currentStageIndex = 1
  else if (currentStatus === 'Development') currentStageIndex = 2
  else if (currentStatus === 'Review') currentStageIndex = 3
  else if (currentStatus === 'Delivery' || currentStatus === 'Delivered') currentStageIndex = 4

  const pct = Math.round(((currentStageIndex + 1) / 5) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── TOP HEADER BAR ─────────────────────────────────────────── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none', fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          dev<span style={{ color: '#f95721' }}>.</span>hyd
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* Notifications Icon Bell */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.4rem', display: 'flex', alignItems: 'center', color: '#64748b' }}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadNotifications.length > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#f95721', borderRadius: '50%', border: '2px solid #ffffff' }} />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '120%', right: 0, width: '320px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '1rem', zIndex: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Alerts & Updates ({unreadNotifications.length})</strong>
                  {unreadNotifications.length > 0 && (
                    <button onClick={handleMarkNotificationsRead} style={{ background: 'none', border: 'none', color: '#f95721', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Mark Read</button>
                  )}
                </div>
                {unreadNotifications.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>No new unread notifications.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                    {unreadNotifications.map(n => (
                      <div key={n.id} style={{ background: '#fff5f0', padding: '0.6rem 0.8rem', borderRadius: '8px', borderLeft: '3px solid #f95721' }}>
                        <strong style={{ fontSize: '0.78rem', color: '#0f172a', display: 'block' }}>{n.title}</strong>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f95721', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              {initials}
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
              Hi, {clientName} <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.1rem' }}>▼</span>
            </span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.6rem', borderRadius: '6px' }}
            title="Logout"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>

        </div>
      </header>

      {/* ADMIN EMULATION BANNER */}
      {adminViewing && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#ef4444', padding: '0.6rem 2rem', fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🛡️ Admin Emulation Mode: Viewing as Client <strong>{client?.name} ({client?.email})</strong></span>
          <button onClick={handleBackToAdmin} style={{ color: '#ef4444', background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}>
            ← Return to Admin Dashboard
          </button>
        </div>
      )}

      {/* ─── MAIN CONTENT CONTAINER ──────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* TOP SUB-NAVIGATION PILL TABS */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          
          <button 
            onClick={() => setActiveSubTab('timeline')} 
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: activeSubTab === 'timeline' ? 'none' : '1px solid #e2e8f0',
              background: activeSubTab === 'timeline' ? '#f95721' : '#ffffff',
              color: activeSubTab === 'timeline' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeSubTab === 'timeline' ? '0 4px 12px rgba(249, 87, 33, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            📅 Project Timeline
          </button>

          <button 
            onClick={() => setActiveSubTab('chat')} 
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: activeSubTab === 'chat' ? 'none' : '1px solid #e2e8f0',
              background: activeSubTab === 'chat' ? '#f95721' : '#ffffff',
              color: activeSubTab === 'chat' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeSubTab === 'chat' ? '0 4px 12px rgba(249, 87, 33, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            💬 Messages
          </button>

          <button 
            onClick={() => setActiveSubTab('files')} 
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: activeSubTab === 'files' ? 'none' : '1px solid #e2e8f0',
              background: activeSubTab === 'files' ? '#f95721' : '#ffffff',
              color: activeSubTab === 'files' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeSubTab === 'files' ? '0 4px 12px rgba(249, 87, 33, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            📁 Files
          </button>

          <button 
            onClick={() => setActiveSubTab('payments')} 
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: activeSubTab === 'payments' ? 'none' : '1px solid #e2e8f0',
              background: activeSubTab === 'payments' ? '#f95721' : '#ffffff',
              color: activeSubTab === 'payments' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeSubTab === 'payments' ? '0 4px 12px rgba(249, 87, 33, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            💳 Payments
          </button>

          <button 
            onClick={() => setActiveSubTab('profile')} 
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              border: activeSubTab === 'profile' ? 'none' : '1px solid #e2e8f0',
              background: activeSubTab === 'profile' ? '#f95721' : '#ffffff',
              color: activeSubTab === 'profile' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeSubTab === 'profile' ? '0 4px 12px rgba(249, 87, 33, 0.25)' : '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            ⚙️ Profile Settings
          </button>
        </div>

        {/* PAGE TITLE */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>My Project Portal</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>Track your project progress and stay updated</p>
        </div>

        {/* ─── TAB CONTENT ────────────────────────────────────────────── */}
        {activeSubTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* 1. OVERVIEW PROJECT HEADER CARD */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem 1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* Box 1: Project Title & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff5f0', border: '1px solid #ffe0d1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f95721', fontSize: '1.4rem' }}>
                  📦
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{activeProject.title}</h3>
                    <span style={{ background: '#fff0eb', color: '#f95721', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {activeProject.package || 'Premium Plan'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                    Project ID: <strong>{activeProject.id ? (activeProject.id.length > 12 ? activeProject.id.substring(0, 8) : activeProject.id) : 'bistro'}</strong>
                  </span>
                </div>
              </div>

              {/* Box 2: Project Cost */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.2rem' }}>Project Cost</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{(activeProject.paymentAmountTotal || 15000).toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#f95721', fontWeight: 600 }}>{activeProject.package || 'Premium Plan'}</span>
              </div>

              {/* Box 3: Progress */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.2rem' }}>Progress</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{pct}%</div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', margin: '0.3rem 0' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#f95721', borderRadius: '10px' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{currentStageIndex + 1} of 5 completed</span>
              </div>

              {/* Box 4: Started On */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.2rem' }}>Started On</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>📅</span> {new Date(activeProject.createdAt || '2026-07-24').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Box 5: Est. Delivery */}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: '0.2rem' }}>Est. Delivery</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>📅</span> {activeProject.deadline ? new Date(activeProject.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Aug 2026'}
                </div>
              </div>

            </div>


            {/* 2. PROJECT TIMELINE STEPPER CARD */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem 1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📊</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Project Timeline</strong>
              </div>

              {/* Horizontal Stepper Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', position: 'relative' }}>
                
                {/* Dotted Connector Line Background */}
                <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', borderTop: '2px dashed #cbd5e1', zIndex: 0 }} />

                {timelineStages.map((stg, i) => {
                  const isCompleted = i < currentStageIndex
                  const isCurrent = i === currentStageIndex
                  const isPending = i > currentStageIndex

                  return (
                    <div key={stg.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      
                      {/* Step Circle Badge */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: (isCompleted || isCurrent) ? '#f95721' : '#cbd5e1',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginBottom: '0.75rem',
                        boxShadow: (isCompleted || isCurrent) ? '0 2px 8px rgba(249, 87, 33, 0.3)' : 'none'
                      }}>
                        {isCompleted ? '✓' : (i + 1)}
                      </div>

                      {/* Step Content Box */}
                      <div style={{
                        width: '100%',
                        background: '#ffffff',
                        border: (isCompleted || isCurrent) ? '1.5px solid #f95721' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1rem 0.75rem',
                        textAlign: 'center',
                        boxShadow: (isCompleted || isCurrent) ? '0 4px 12px rgba(249, 87, 33, 0.06)' : 'none'
                      }}>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{stg.title}</strong>
                        
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'block',
                          color: isCompleted ? '#16a34a' : isCurrent ? '#f95721' : '#94a3b8'
                        }}>
                          {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                        </span>

                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem', display: 'block' }}>
                          {isCompleted ? stg.date : isCurrent ? (stg.date || '26 Jul 2026') : '-'}
                        </span>
                      </div>

                    </div>
                  )
                })}

              </div>

            </div>


            {/* 3. TWO-COLUMN GRID: UPCOMING REVIEW CALL & PROJECT ACCESS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* LEFT CARD: UPCOMING REVIEW CALL */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #f95721',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f95721', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    <span>🚀</span> UPCOMING REVIEW CALL
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#0f172a' }}>
                    Scheduled Client Review Call
                  </h3>

                  <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                    Join live video call with Lead Developer for project demos, design reviews & Q&A.
                  </p>

                  {/* Info Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 500 }}>📅 Date & Time</span>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>26 Jul 2026, 07:00 PM IST</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 500 }}>👤 With</span>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Lead Developer</strong>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Google Meet Orange Button */}
                  <a
                    href={activeProject.meet_url || "https://meet.google.com/dev-hyd-client-call"}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.85rem',
                      background: '#f95721',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(249, 87, 33, 0.25)',
                      marginBottom: '1rem'
                    }}
                  >
                    🎥 Join Google Meet Call ↗
                  </a>

                  {/* Sub Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/client/project/${activeProject.id || activeProject._id}`}
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        textDecoration: 'none',
                        textAlign: 'center',
                        background: '#ffffff'
                      }}
                    >
                      📹 View Full Details
                    </Link>

                    <a
                      href="https://wa.me/917780252258"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        textDecoration: 'none',
                        textAlign: 'center',
                        background: '#ffffff'
                      }}
                    >
                      💬 WhatsApp Support
                    </a>
                  </div>
                </div>

              </div>


              {/* RIGHT CARD: PROJECT ACCESS & CREDENTIALS */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem 1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f95721', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>
                    <span>🔑</span> Project Access & Credentials
                  </div>

                  {/* Credentials List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    
                    {/* Staging URL Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', color: '#64748b' }}>🌐</span>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Staging URL</span>
                          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{activeProject.staging_url || 'https://staging.devhyd.com'}</strong>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopyText(activeProject.staging_url || 'https://staging.devhyd.com', 'url')}
                        style={{ padding: '0.35rem 0.75rem', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {copiedField === 'url' ? '✓ Copied' : '📄 Copy'}
                      </button>
                    </div>

                    {/* Login Email Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', color: '#64748b' }}>✉️</span>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Portal Login Email</span>
                          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{client?.email || 'karthik@modernbistro.com'}</strong>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopyText(client?.email || 'karthik@modernbistro.com', 'email')}
                        style={{ padding: '0.35rem 0.75rem', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {copiedField === 'email' ? '✓ Copied' : '📄 Copy'}
                      </button>
                    </div>

                    {/* Password Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', color: '#64748b' }}>🔒</span>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Password</span>
                          <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                            {showPassword ? 'DevHydPass2026!' : '••••••••••••'}
                          </strong>
                        </div>
                        <button 
                          onClick={() => setShowPassword(!showPassword)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}
                          title="Toggle visibility"
                        >
                          👁️
                        </button>
                      </div>
                      <button 
                        onClick={() => handleCopyText('DevHydPass2026!', 'password')}
                        style={{ padding: '0.35rem 0.75rem', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {copiedField === 'password' ? '✓ Copied' : '📄 Copy'}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Open Staging Site Button */}
                <a
                  href={activeProject.staging_url || "https://staging.devhyd.com"}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: '#ffffff'
                  }}
                >
                  ↗ Open Staging Preview Site
                </a>

              </div>

            </div>

          </div>
        )}

        {/* 💬 CHAT MESSAGES PANEL */}
        {activeSubTab === 'chat' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#0f172a' }}>💬 Communication Room</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Message your lead developer directly regarding revisions, feedback, or updates.</p>
            
            {/* Chat Log */}
            <div style={{ height: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: '0.88rem' }}>No messages yet. Send a message to start the conversation!</div>
              ) : (
                messages.map((m, idx) => {
                  const isAdmin = m.sender_role === 'admin'
                  return (
                    <div key={m._id || idx} style={{ alignSelf: isAdmin ? 'flex-start' : 'flex-end', background: isAdmin ? '#ffffff' : '#fff5f0', color: '#0f172a', padding: '0.75rem 1.1rem', borderRadius: '14px', maxWidth: '72%', border: isAdmin ? '1px solid #e2e8f0' : '1px solid #ffe0d1', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4 }}>{m.text}</p>
                      <small style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', textAlign: 'right', marginTop: '0.3rem' }}>
                        {isAdmin ? 'Lead Developer' : 'You'} • {new Date(m.created_at || new Date()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  )
                })
              )}
            </div>

            {/* Send Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                style={{ flex: 1, padding: '0.75rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                required
              />
              <button type="submit" style={{ padding: '0.75rem 1.75rem', background: '#f95721', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }} disabled={chatSubmitting}>
                {chatSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {/* 📁 FILES WORKSPACE */}
        {activeSubTab === 'files' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#0f172a' }}>📁 Project Deliverables & Assets</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Download layouts, media assets, or code builds provided by your developer, or upload files directly.</p>

            {/* Upload Form */}
            <form onSubmit={(e) => handleFileUpload(e, activeProject.id || activeProject._id)} style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '1.75rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Upload Document/Asset</strong>
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Asset Display Name (e.g. Logo Vector)" 
                  value={fileNameInput} 
                  onChange={e => setFileNameInput(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem 1rem', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                />
                <input 
                  type="file" 
                  onChange={e => setFileToUpload(e.target.files[0])}
                  style={{ fontSize: '0.85rem' }}
                  required
                />
              </div>
              <button type="submit" style={{ padding: '0.6rem 1.75rem', fontSize: '0.85rem', background: '#f95721', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }} disabled={fileSubmitting}>
                {fileSubmitting ? 'Uploading...' : 'Upload File'}
              </button>
            </form>

            {/* Files List */}
            <strong style={{ display: 'block', marginBottom: '0.85rem', fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AVAILABLE DELIVERABLES ({activeProject.files?.length || 0})
            </strong>
            {!activeProject.files || activeProject.files.length === 0 ? (
              <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: '#94a3b8' }}>No deliverables uploaded yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {activeProject.files.map((file, idx) => (
                  <div key={file.id || file._id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', display: 'block', color: '#0f172a' }}>{file.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Uploaded: {new Date(file.uploaded_at || Date.now()).toLocaleDateString('en-IN')}</span>
                    </div>
                    <a href={file.url} target="_blank" rel="noreferrer" style={{ padding: '0.35rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.78rem', color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 💳 INVOICES & PAYMENTS TAB */}
        {activeSubTab === 'payments' && (
          <ProjectPaymentTab p={activeProject} data={data} onRefresh={fetchClientDashboardData} />
        )}

        {/* ⚙️ PROFILE SETTINGS TAB */}
        {activeSubTab === 'profile' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#0f172a' }}>⚙️ Profile & Account Settings</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Update your contact information for automated SMS/email alerts.</p>

            <form onSubmit={handleProfileSubmit} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>Phone Number (WhatsApp Notifications)</label>
                <input 
                  type="text" 
                  value={profileForm.phone} 
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <button type="submit" style={{ padding: '0.85rem 1.75rem', background: '#f95721', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', width: 'fit-content' }} disabled={profileSubmitting}>
                {profileSubmitting ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ─── FOOTER BAR ─────────────────────────────────────────────── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1.25rem 2rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: '#64748b' }}>
        <div>
          © 2026 dev.hyd &nbsp;&nbsp;|&nbsp;&nbsp; <Link to="/legal/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link> &nbsp;&nbsp;|&nbsp;&nbsp; <Link to="/legal/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
        <div>
          <Link to="/" style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>Back to Website ↗</Link>
        </div>
      </footer>

    </div>
  )
}
