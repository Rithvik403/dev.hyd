import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ClientForm() {
  // Client details
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('Client123!')
  const [showPassword, setShowPassword] = useState(false)

  // Project details (integrated project creation)
  const [createProject, setCreateProject] = useState(true)
  const [projectTitle, setProjectTitle] = useState('')
  const [pkg, setPkg] = useState('Standard – ₹8,000')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Discovery')
  const [deadline, setDeadline] = useState('')
  const [paymentTotal, setPaymentTotal] = useState('8000')
  const [paymentPaid, setPaymentPaid] = useState('0')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Auto-suggest project title when client name changes if title is pristine
  const handleNameChange = (e) => {
    const val = e.target.value
    setName(val)
    if (!projectTitle || projectTitle.endsWith("'s Website Project") || projectTitle.endsWith(" Website")) {
      setProjectTitle(val ? `${val.trim()}'s Website Project` : '')
    }
  }

  const handlePackageChange = (selectedPkg, amountStr) => {
    setPkg(selectedPkg)
    setPaymentTotal(amountStr)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    toast.loading(createProject ? 'Creating client & launching project...' : 'Creating client account...')

    try {
      // Step 1: Create Client Account
      const clientRes = await adminApi.createClient({ name, email, phone, password })
      const clientId = clientRes.data.client.id || clientRes.data.client._id

      // Step 2: Optionally Create Initial Project for this Client
      if (createProject && clientId) {
        const finalTitle = projectTitle.trim() || `${name}'s Website Project`
        await adminApi.createProject({
          client_id: clientId,
          title: finalTitle,
          description: description || 'Initial website development project.',
          package: pkg,
          status,
          deadline: deadline || undefined,
          payment_status: Number(paymentPaid) >= Number(paymentTotal) && Number(paymentTotal) > 0 ? 'Paid' : Number(paymentPaid) > 0 ? 'Partially Paid' : 'Unpaid',
          payment_amount_total: Number(paymentTotal || 0),
          payment_amount_paid: Number(paymentPaid || 0)
        })
      }

      toast.dismiss()
      toast.success(createProject ? '🎉 Client & Project created successfully!' : '🎉 Client created successfully!')
      navigate('/admin')
    } catch (err) {
      toast.dismiss()
      const msg = err.response?.data?.error || err.message || 'Failed to complete registration'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
        <nav className="sidebar-nav">
          <Link to="/admin">📊 Dashboard</Link>
          <Link to="/admin/clients/new" className="active">➕ New Client</Link>
          <Link to="/admin/projects/new">🚀 New Project</Link>
          <Link to="/admin/blog/new">✍️ New Post</Link>
          <Link to="/" target="_blank">🌐 View Site</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="form-page-header">
          <div className="form-page-badge">👥 CLIENT & PROJECT ONBOARDING</div>
          <h1>Register New Client</h1>
          <p className="form-page-subtitle">Create a client account and launch their website project in one simple step.</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form-container">
          {error && (
            <div className="form-error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* SECTION 1: CLIENT DETAILS */}
          <div className="form-card-section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <div>
                <h3>Client Account Details</h3>
                <p>Personal and authentication details for the client portal login.</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Full Name *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Anjali Verma" 
                    value={name} 
                    onChange={handleNameChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Email Address * (Client Login)</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input 
                    type="email" 
                    placeholder="e.g. anjali@salonstudio.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Phone Number (WhatsApp)</label>
                <div className="input-with-icon">
                  <span className="input-icon">📱</span>
                  <input 
                    type="tel" 
                    placeholder="e.g. 9876543210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Portal Login Password *</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6} 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <small className="field-hint">Default is set to <code>Client123!</code> — Client can reset anytime.</small>
              </div>
            </div>
          </div>

          {/* SECTION 2: INTEGRATED PROJECT CREATION TOGGLE */}
          <div className="form-card-section toggle-highlight-section">
            <label className="toggle-switch-container">
              <input 
                type="checkbox" 
                checked={createProject}
                onChange={(e) => setCreateProject(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <div className="toggle-label-content">
                <strong>🚀 Setup New Project for this Client Immediately</strong>
                <span>Automatically link a project workspace so the client can track progress on day 1.</span>
              </div>
            </label>

            {createProject && (
              <div className="project-nested-form">
                <div className="section-divider"></div>
                <div className="section-header" style={{ marginBottom: '1.25rem' }}>
                  <span className="section-icon">💼</span>
                  <div>
                    <h3>Initial Project Setup</h3>
                    <p>Configure scope, pricing, initial stage, and deadline for this client.</p>
                  </div>
                </div>

                <div className="form-field">
                  <label>Project Title *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📌</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Luxury Unisex Salon Website" 
                      value={projectTitle} 
                      onChange={(e) => setProjectTitle(e.target.value)} 
                      required={createProject}
                    />
                  </div>
                </div>

                {/* Package Select Pills */}
                <div className="form-field">
                  <label>Select Package Plan</label>
                  <div className="package-pill-grid">
                    {[
                      { name: 'Basic – ₹5,000', amount: '5000', label: 'Basic Site', icon: '🌱' },
                      { name: 'Standard – ₹8,000', amount: '8000', label: 'Popular Package', icon: '🚀' },
                      { name: 'Premium – ₹15,000', amount: '15000', label: 'Full Featured', icon: '⭐' },
                      { name: 'Social Media – ₹5,000/month', amount: '5000', label: 'Monthly Growth', icon: '👑' }
                    ].map(item => (
                      <div 
                        key={item.name}
                        className={`package-pill-card ${pkg === item.name ? 'active' : ''}`}
                        onClick={() => handlePackageChange(item.name, item.amount)}
                      >
                        <div className="pill-icon">{item.icon}</div>
                        <div className="pill-info">
                          <strong>{item.name}</strong>
                          <span>{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label>Project Description / Scope</label>
                  <textarea 
                    rows="3" 
                    placeholder="Provide details on deliverables, features, design preferences..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>Initial Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Discovery">Discovery 🔍</option>
                      <option value="Design">Design 🎨</option>
                      <option value="Development">Development 💻</option>
                      <option value="Review">Review 👁️</option>
                      <option value="Delivered">Delivered 🎉</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Target Deadline</label>
                    <input 
                      type="date" 
                      value={deadline} 
                      onChange={(e) => setDeadline(e.target.value)} 
                    />
                  </div>

                  <div className="form-field">
                    <label>Total Value (₹)</label>
                    <input 
                      type="number" 
                      step="500"
                      min="0"
                      placeholder="8000" 
                      value={paymentTotal} 
                      onChange={(e) => setPaymentTotal(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Advance Payment Paid Now (₹)</label>
                    <input 
                      type="number" 
                      step="500"
                      min="0"
                      placeholder="0" 
                      value={paymentPaid} 
                      onChange={(e) => setPaymentPaid(e.target.value)} 
                    />
                  </div>

                  <div className="form-field">
                    <label>Payment Summary</label>
                    <div className="payment-summary-box">
                      <span>Pending Balance:</span>
                      <strong style={{ color: (Number(paymentTotal) - Number(paymentPaid)) > 0 ? '#ef4444' : '#16a34a' }}>
                        ₹{Math.max(0, Number(paymentTotal || 0) - Number(paymentPaid || 0)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FORM ACTIONS */}
          <div className="form-actions-bar">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating...' : createProject ? '✨ Create Client & Launch Project' : '👤 Create Client Account'}
            </button>
            <Link to="/admin" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
