import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { publicApi } from '../services/api'
import { paymentApi } from '../services/api'

// Sample active projects data with Financials & Milestone Installments
const MOCK_PROJECTS = {
  'DEV-8492': {
    id: 'DEV-8492',
    clientName: 'Anjali Verma',
    businessName: 'Luxury Salon & Spa',
    projectType: 'Web App & WhatsApp Booking System',
    startDate: '12 July 2026',
    estimatedCompletion: '26 July 2026',
    progressPct: 75,
    status: 'In Progress (Development Phase)',
    latestUpdate: 'Backend API & WhatsApp automation completed. Currently finalizing mobile UI styling & responsive testing.',
    financials: {
      totalCost: 35000,
      totalPaid: 17500,
      remainingBalance: 17500,
      installments: [
        { id: 'inst-1', title: '50% Advance Booking Deposit', amount: 17500, status: 'paid', date: '12 Jul 2026', receiptId: 'RCP-8492-1' },
        { id: 'inst-2', title: '25% Mid-Project Development Milestone', amount: 8750, status: 'due', date: 'Due Now' },
        { id: 'inst-3', title: '25% Final Launch & Domain Handover', amount: 8750, status: 'upcoming', date: '26 Jul 2026' }
      ]
    },
    milestones: [
      { id: 1, title: 'Project Scope & Contract Signed', status: 'completed', date: '12 Jul' },
      { id: 2, title: 'UI/UX Wireframe & Design Approval', status: 'completed', date: '16 Jul' },
      { id: 3, title: 'Full-Stack Development (React & Node)', status: 'in-progress', date: '21 Jul' },
      { id: 4, title: 'Performance Testing & QA', status: 'upcoming', date: '24 Jul' },
      { id: 5, title: 'Final Launch & Domain Setup', status: 'upcoming', date: '26 Jul' }
    ]
  },
  'DEV-3910': {
    id: 'DEV-3910',
    clientName: 'Karthik Reddy',
    businessName: 'Modern Bistro Jubilee Hills',
    projectType: 'Mobile QR Menu & Web App',
    startDate: '05 July 2026',
    estimatedCompletion: '18 July 2026',
    progressPct: 100,
    status: 'Completed & Launched 🚀',
    latestUpdate: 'Domain setup, SSL certificate & QR code menus successfully deployed to production.',
    financials: {
      totalCost: 28000,
      totalPaid: 28000,
      remainingBalance: 0,
      installments: [
        { id: 'inst-1', title: '50% Advance Booking Deposit', amount: 14000, status: 'paid', date: '05 Jul 2026', receiptId: 'RCP-3910-1' },
        { id: 'inst-2', title: '25% Mid-Project Milestone', amount: 7000, status: 'paid', date: '12 Jul 2026', receiptId: 'RCP-3910-2' },
        { id: 'inst-3', title: '25% Final Launch Balance', amount: 7000, status: 'paid', date: '18 Jul 2026', receiptId: 'RCP-3910-3' }
      ]
    },
    milestones: [
      { id: 1, title: 'Scope & Menu Catalog Gathering', status: 'completed', date: '05 Jul' },
      { id: 2, title: 'Mobile-First UI Design', status: 'completed', date: '08 Jul' },
      { id: 3, title: 'QR Code & Ordering Engine', status: 'completed', date: '12 Jul' },
      { id: 4, title: 'Testing & Mobile Optimization', status: 'completed', date: '15 Jul' },
      { id: 5, title: 'Live Launch on Custom Domain', status: 'completed', date: '18 Jul' }
    ]
  }
}

export default function ProjectTracker() {
  const [searchId, setSearchId] = useState('')
  const [activeProject, setActiveProject] = useState(MOCK_PROJECTS['DEV-8492'])
  const [activeProjectRealId, setActiveProjectRealId] = useState(null) // actual DB UUID
  
  // Payment Modal states
  const [selectedInstallment, setSelectedInstallment] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const handleSearch = async (e) => {
    e.preventDefault()
    const query = searchId.trim()
    if (!query) {
      toast.error('Please enter a Project ID or Email address')
      return
    }

    const key = query.toUpperCase()
    if (MOCK_PROJECTS[key]) {
      setActiveProject(MOCK_PROJECTS[key])
      toast.success(`Loaded Demo Project #${key}`)
      return
    }

    try {
      const res = await publicApi.trackProject(query)
      const p = res.data
      const totalCost = Number(p.paymentAmountTotal ?? p.payment_amount_total ?? 0)
      const totalPaid = Number(p.paymentAmountPaid ?? p.payment_amount_paid ?? 0)
      const remainingBalance = Math.max(0, totalCost - totalPaid)

      // Map real DB payments to installment format
      const realPayments = p.payments || []
      const installments = realPayments.length > 0
        ? realPayments.map((pmt, idx) => ({
            id: pmt.id, // real DB UUID for Pay Now
            title: pmt.label,
            amount: Number(pmt.amountDue),
            status: pmt.status === 'paid' ? 'paid' : 'due',
            date: pmt.paidAt ? new Date(pmt.paidAt).toLocaleDateString('en-IN') : 'Due Now',
            receiptId: pmt.razorpayPaymentId ? `PAY-${pmt.razorpayPaymentId.slice(-6).toUpperCase()}` : null
          }))
        : [{ id: null, title: 'Total Project Cost', amount: totalCost, status: totalPaid >= totalCost ? 'paid' : 'due', date: 'Active' }]

      setActiveProjectRealId(p.id) // store real UUID
      setActiveProject({
        id: p.id || query,
        clientName: p.client?.name || 'Client',
        businessName: p.title || 'Project',
        projectType: p.package || 'Web Development',
        startDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Recent',
        estimatedCompletion: p.deadline ? new Date(p.deadline).toLocaleDateString('en-IN') : 'In Progress',
        progressPct: p.status === 'Delivered' ? 100 : p.status === 'Review' ? 85 : p.status === 'Development' ? 60 : 35,
        status: p.status || 'Active',
        latestUpdate: p.description || 'Project is under active development.',
        financials: { totalCost, totalPaid, remainingBalance, installments },
        milestones: p.updates && p.updates.length > 0
          ? p.updates.map((u, i) => ({ id: i + 1, title: u.status, status: 'completed', date: new Date(u.date).toLocaleDateString('en-IN') }))
          : [
              { id: 1, title: 'Project Initiated', status: 'completed', date: 'Done' },
              { id: 2, title: 'Development & Build', status: p.status === 'Delivered' ? 'completed' : 'in-progress', date: 'Active' },
              { id: 3, title: 'Final Handover & Launch', status: p.status === 'Delivered' ? 'completed' : 'upcoming', date: 'Pending' }
            ]
      })
      toast.success(`Loaded Project for "${query}"`)
    } catch (err) {
      toast.error(`Project or Email "${query}" not found.`)
    }
  }

  const loadDemo = (id) => {
    setSearchId(id)
    setActiveProject(MOCK_PROJECTS[id])
    setActiveProjectRealId(null) // demo projects have no real UUID
    setSelectedInstallment(null)
    setPaymentSuccess(false)
  }

  const openPayModal = (installment) => {
    // Demo projects use mock payment
    if (!activeProjectRealId || installment.id === null || installment.id?.startsWith('inst-')) {
      setSelectedInstallment({ ...installment, isDemo: true })
      setPaymentSuccess(false)
      return
    }
    setSelectedInstallment(installment)
    setPaymentSuccess(false)
  }

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true)
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handleProcessPayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Demo mode — simulate payment
    if (!activeProjectRealId || selectedInstallment?.isDemo) {
      setTimeout(() => {
        setIsProcessing(false)
        setPaymentSuccess(true)
        toast.success('Demo Payment Received! (Test Mode)')
        if (selectedInstallment && activeProject) {
          const updatedInstallments = activeProject.financials.installments.map(inst =>
            inst.id === selectedInstallment.id
              ? { ...inst, status: 'paid', date: 'Today', receiptId: `RCP-DEMO-${Math.floor(1000 + Math.random() * 9000)}` }
              : inst
          )
          setActiveProject({
            ...activeProject,
            financials: {
              ...activeProject.financials,
              totalPaid: activeProject.financials.totalPaid + selectedInstallment.amount,
              remainingBalance: Math.max(0, activeProject.financials.remainingBalance - selectedInstallment.amount),
              installments: updatedInstallments
            }
          })
        }
      }, 1200)
      return
    }

    // Real payment via Razorpay
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.')
        setIsProcessing(false)
        return
      }

      const orderRes = await paymentApi.createOrder({
        payment_id: selectedInstallment.id,
        project_id: activeProjectRealId
      })
      const { order_id, amount, currency, key, payment_id } = orderRes.data

      const options = {
        key,
        amount,
        currency,
        name: 'dev.hyd',
        description: selectedInstallment.title,
        order_id,
        prefill: {
          name: activeProject.clientName,
          contact: activeProject.phone || ''
        },
        theme: { color: '#FF4D00' },
        config: {
          display: {
            preferences: {
              show_default_blocks: true
            }
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast('Payment cancelled')
          }
        },
        handler: async (response) => {
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id
            })
            setIsProcessing(false)
            setPaymentSuccess(true)
            toast.success('Payment Successful! Receipt Generated.')

            // Update UI state
            const updatedInstallments = activeProject.financials.installments.map(inst =>
              inst.id === selectedInstallment.id
                ? { ...inst, status: 'paid', date: 'Today', receiptId: `PAY-${response.razorpay_payment_id.slice(-6).toUpperCase()}` }
                : inst
            )
            setActiveProject({
              ...activeProject,
              financials: {
                ...activeProject.financials,
                totalPaid: activeProject.financials.totalPaid + selectedInstallment.amount,
                remainingBalance: Math.max(0, activeProject.financials.remainingBalance - selectedInstallment.amount),
                installments: updatedInstallments
              }
            })
          } catch (err) {
            setIsProcessing(false)
            toast.error('Payment received but verification failed. Contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setIsProcessing(false) // reset — Razorpay handles its own loading state
    } catch (err) {
      setIsProcessing(false)
      toast.error(err.response?.data?.error || 'Failed to initiate payment. Please try again.')
    }
  }

  return (
    <div className="tracker-page">
      
      {/* Header */}
      <header className="tracker-nav">
        <Link to="/" className="logo">
          dev<span>.</span>hyd
        </Link>
        <div className="tracker-nav-right">
          <Link to="/" className="btn btn-outline-sm">← Back to Home</Link>
        </div>
      </header>

      <main className="tracker-content">
        
        {/* Search Hero Section */}
        <section className="tracker-hero text-center">
          <span className="badge-pill">CLIENT PORTAL & BILLING</span>
          <h1>Track Progress & Milestone Payments</h1>
          <p className="subtitle">Enter your Project ID to view live progress, milestone updates & pay installment balances securely.</p>

          <form onSubmit={handleSearch} className="tracker-search-form">
            <input
              type="text"
              placeholder="Enter Project ID (e.g. DEV-8492)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="tracker-input"
            />
            <button type="submit" className="btn btn-primary tracker-btn">
              Track Project →
            </button>
          </form>

          <div className="tracker-demo-shortcuts">
            <span>Try sample project:</span>
            <button type="button" className="demo-chip" onClick={() => loadDemo('DEV-8492')}>
              DEV-8492 (Due Milestone ₹8,750)
            </button>
            <button type="button" className="demo-chip" onClick={() => loadDemo('DEV-3910')}>
              DEV-3910 (Fully Paid)
            </button>
          </div>
        </section>

        {activeProject && (
          <section className="tracker-dashboard">
            
            {/* Top Project Banner */}
            <div className="project-banner">
              <div className="banner-left">
                <span className="project-id-tag">PROJECT #{activeProject.id}</span>
                <h2>{activeProject.businessName}</h2>
                <p className="project-type-text">{activeProject.projectType}</p>
              </div>

              <div className="banner-right">
                <div className="status-badge-wrap">
                  <span className="status-dot"></span>
                  <span className="status-text">{activeProject.status}</span>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="tracker-progress-card">
              <div className="progress-card-head">
                <span className="progress-title">Overall Development Progress</span>
                <span className="progress-pct-bold">{activeProject.progressPct}%</span>
              </div>

              <div className="progress-track-outer">
                <div 
                  className="progress-track-fill" 
                  style={{ width: `${activeProject.progressPct}%` }}
                />
              </div>

              <div className="progress-dates-row">
                <span>Start Date: <strong>{activeProject.startDate}</strong></span>
                <span>Target Launch: <strong>{activeProject.estimatedCompletion}</strong></span>
              </div>
            </div>

            {/* Milestones & Developer Updates Grid (Top Section) */}
            <div className="tracker-details-grid">
              
              {/* Milestones Timeline */}
              <div className="milestones-card">
                <h3>Development Milestones</h3>
                <div className="milestones-timeline">
                  {activeProject.milestones.map((m, idx) => (
                    <div key={m.id} className={`timeline-item item-${m.status}`}>
                      <div className="timeline-icon">
                        {m.status === 'completed' && '✓'}
                        {m.status === 'in-progress' && '⏳'}
                        {m.status === 'upcoming' && (idx + 1)}
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-title-row">
                          <span className="m-title">{m.title}</span>
                          <span className="m-date">{m.date}</span>
                        </div>
                        <span className={`m-badge badge-${m.status}`}>
                          {m.status === 'completed' && 'Completed'}
                          {m.status === 'in-progress' && 'In Progress'}
                          {m.status === 'upcoming' && 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Update Sidebar */}
              <div className="update-sidebar-card">
                <h3>Latest Developer Update</h3>
                <div className="update-box">
                  <div className="update-box-head">
                    <span className="dev-avatar">👨‍💻</span>
                    <div className="dev-info">
                      <strong>Lead Developer (dev.hyd)</strong>
                      <span className="update-time">Updated Recently</span>
                    </div>
                  </div>
                  <p className="update-text">{activeProject.latestUpdate}</p>
                </div>

                <div className="client-info-box">
                  <div className="info-row">
                    <span className="info-lbl">Client Name:</span>
                    <span className="info-val">{activeProject.clientName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-lbl">Project ID:</span>
                    <span className="info-val">#{activeProject.id}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/917780252258?text=${encodeURIComponent(`Hi dev.hyd! I am checking status/billing for my Project #${activeProject.id} (${activeProject.businessName}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-update-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>

            {/* Payment & Billing Breakdown Card (Bottom Section) */}
            <div className="tracker-billing-card">
              <div className="billing-head">
                <div>
                  <h3>Project Payment & Billing Summary</h3>
                  <p className="billing-sub">Transparent milestone billing and receipt tracking</p>
                </div>
                <div className="billing-stats-row">
                  <div className="b-stat">
                    <span className="b-lbl">Total Value</span>
                    <span className="b-val">{formatINR(activeProject.financials.totalCost)}</span>
                  </div>
                  <div className="b-stat">
                    <span className="b-lbl">Total Paid</span>
                    <span className="b-val green">{formatINR(activeProject.financials.totalPaid)}</span>
                  </div>
                  <div className="b-stat">
                    <span className="b-lbl">Remaining Balance</span>
                    <span className="b-val orange">{formatINR(activeProject.financials.remainingBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Installment Milestone Table */}
              <div className="installments-list">
                {activeProject.financials.installments.map((inst, index) => (
                  <div key={inst.id} className={`installment-row row-${inst.status}`}>
                    <div className="inst-num">{index + 1}</div>
                    
                    <div className="inst-details">
                      <strong className="inst-title">{inst.title}</strong>
                      <span className="inst-date">{inst.date}</span>
                    </div>

                    <div className="inst-amount">
                      {formatINR(inst.amount)}
                    </div>

                    <div className="inst-action">
                      {inst.status === 'paid' && (
                        <span className="paid-badge">
                          ✓ Paid ({inst.receiptId || 'Verified'})
                        </span>
                      )}

                      {inst.status === 'due' && (
                        <button
                          type="button"
                          className="pay-now-btn"
                          onClick={() => openPayModal(inst)}
                        >
                          Pay {formatINR(inst.amount)} Now →
                        </button>
                      )}

                      {inst.status === 'upcoming' && (
                        <span className="upcoming-badge">
                          🔒 Scheduled for Launch
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </main>

      {/* Payment Gateway Modal */}
      {selectedInstallment && (
        <div className="pay-modal-backdrop" onClick={() => setSelectedInstallment(null)}>
          <div className="pay-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedInstallment(null)}
            >
              ×
            </button>

            {!paymentSuccess ? (
              <form onSubmit={handleProcessPayment} className="pay-modal-form">
                <div className="pay-modal-head">
                  <span className="pay-sub-tag">SECURE MILESTONE PAYMENT</span>
                  <h2>Pay {formatINR(selectedInstallment.amount)}</h2>
                  <p className="pay-for-text">For: {selectedInstallment.title} (#{activeProject.id?.slice(0, 8)}…)</p>
                </div>

                {selectedInstallment.isDemo ? (
                  /* Demo project — show fake method selector */
                  <div className="pay-method-content">
                    <div className="pay-methods-grid">
                      <span className="pay-method-btn active"><span>⚡ UPI / GPay / PhonePe</span></span>
                      <span className="pay-method-btn"><span>💳 Credit / Debit Card</span></span>
                      <span className="pay-method-btn"><span>🏦 NetBanking</span></span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
                      This is a <strong>demo project</strong>. No real payment will be charged.
                    </p>
                  </div>
                ) : (
                  /* Real project — Direct UPI QR & Razorpay Options */
                  <div className="pay-method-content" style={{ textAlign: 'center' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>📱 Scan QR Code with GPay / PhonePe / Paytm</div>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=7780252258@ybl&pn=dev.hyd&am=${selectedInstallment.amount}&cu=INR&tn=${encodeURIComponent(selectedInstallment.title)}`)}`}
                        alt="UPI QR Code"
                        style={{ width: '170px', height: '170px', borderRadius: '8px', margin: '0 auto', display: 'block', border: '1px solid #cbd5e1' }}
                      />
                      <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                        UPI ID: <strong>7780252258@ybl</strong>
                      </div>
                    </div>

                    <a
                      href={`upi://pay?pa=7780252258@ybl&pn=dev.hyd&am=${selectedInstallment.amount}&cu=INR&tn=${encodeURIComponent(selectedInstallment.title)}`}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem', marginBottom: '0.75rem', display: 'block', textDecoration: 'none', background: '#16a34a' }}
                    >
                      🚀 Open in GPay / PhonePe / Paytm →
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="pay-submit-btn"
                >
                  {isProcessing
                    ? 'Opening Payment Gateway...'
                    : selectedInstallment.isDemo
                      ? `Simulate Payment ${formatINR(selectedInstallment.amount)} →`
                      : `Pay ${formatINR(selectedInstallment.amount)} via Razorpay (UPI / Card) →`}
                </button>

                <div className="pay-security-note">
                  🔒 256-Bit SSL Encrypted • Powered by Razorpay & Instant UPI
                </div>
              </form>

            ) : (
              <div className="pay-success-box text-center">
                <div className="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <p className="success-amt">{formatINR(selectedInstallment.amount)} Paid Successfully</p>
                <p className="success-desc">Receipt copy sent to developer. Your project milestone is updated in real-time.</p>

                <a
                  href={`https://wa.me/917780252258?text=${encodeURIComponent(`Hi dev.hyd! I just paid ${formatINR(selectedInstallment.amount)} for milestone "${selectedInstallment.title}" (Project #${activeProject.id}). Please confirm receipt.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-receipt-btn"
                >
                  Send Payment Receipt on WhatsApp
                </a>

                <button
                  type="button"
                  className="done-btn"
                  onClick={() => setSelectedInstallment(null)}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
