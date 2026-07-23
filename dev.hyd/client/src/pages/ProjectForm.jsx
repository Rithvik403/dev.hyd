import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ProjectForm() {
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')

  // Inline Quick Client Creation State
  const [createNewClient, setCreateNewClient] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientPassword, setClientPassword] = useState('Client123!')

  // Project State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pkg, setPkg] = useState('Standard – ₹8,000')
  const [status, setStatus] = useState('Discovery')
  const [deadline, setDeadline] = useState('')
  const [paymentTotal, setPaymentTotal] = useState('8000')
  const [paymentPaid, setPaymentPaid] = useState('0')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => {
        setClients(res.data.clients || [])
      })
      .catch(() => {
        toast.error('Could not load clients list')
      })
  }, [])

  const handlePackageChange = (selectedPkg, amountStr) => {
    setPkg(selectedPkg)
    setPaymentTotal(amountStr)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    toast.loading('Creating project...')

    try {
      let finalClientId = clientId

      // If Quick Create Client is checked, create client first
      if (createNewClient) {
        if (!clientName || !clientEmail) {
          throw new Error('Please enter Client Name and Email')
        }
        const clientRes = await adminApi.createClient({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          password: clientPassword
        })
        finalClientId = clientRes.data.client.id || clientRes.data.client._id
      }

      if (!finalClientId) {
        throw new Error('Please select an existing client or register a new client')
      }

      await adminApi.createProject({
        client_id: finalClientId,
        title,
        description,
        package: pkg,
        status,
        deadline: deadline || undefined,
        payment_status: Number(paymentPaid) >= Number(paymentTotal) && Number(paymentTotal) > 0 ? 'Paid' : Number(paymentPaid) > 0 ? 'Partially Paid' : 'Unpaid',
        payment_amount_total: Number(paymentTotal || 0),
        payment_amount_paid: Number(paymentPaid || 0)
      })

      toast.dismiss()
      toast.success('🚀 Project created successfully!')
      navigate('/admin')
    } catch (err) {
      toast.dismiss()
      const msg = err.response?.data?.error || err.message || 'Failed to create project'
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
          <Link to="/admin/clients/new">➕ New Client</Link>
          <Link to="/admin/projects/new" className="active">🚀 New Project</Link>
          <Link to="/admin/blog/new">✍️ New Post</Link>
          <Link to="/" target="_blank">🌐 View Site</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="form-page-header">
          <div className="form-page-badge">🚀 PROJECT MANAGEMENT</div>
          <h1>Create New Project</h1>
          <p className="form-page-subtitle">Setup a project workspace, define deliverables, and set milestones.</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form-container">
          {error && (
            <div className="form-error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* SECTION 1: CLIENT SELECTION & INLINE CREATION */}
          <div className="form-card-section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <div>
                <h3>Client Selection</h3>
                <p>Assign this project to an existing client or quickly register a new client.</p>
              </div>
            </div>

            {!createNewClient ? (
              <div className="form-field">
                <label>Select Client *</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="input-with-icon" style={{ flex: 1 }}>
                    <span className="input-icon">🏢</span>
                    <select 
                      value={clientId} 
                      onChange={(e) => setClientId(e.target.value)} 
                      required={!createNewClient}
                    >
                      <option value="">Select an existing client...</option>
                      {clients.map(c => (
                        <option value={c.id || c._id} key={c.id || c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ borderRadius: '10px', fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '0.65rem 1rem' }}
                    onClick={() => setCreateNewClient(true)}
                  >
                    + Quick Add New Client
                  </button>
                </div>
              </div>
            ) : (
              <div className="toggle-highlight-section" style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>➕ Register New Client inline</strong>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => setCreateNewClient(false)}
                  >
                    Select Existing Client Instead
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Client Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      value={clientName} 
                      onChange={e => setClientName(e.target.value)} 
                      required={createNewClient} 
                    />
                  </div>
                  <div className="form-field">
                    <label>Client Email * (Login)</label>
                    <input 
                      type="email" 
                      placeholder="e.g. rahul@business.com" 
                      value={clientEmail} 
                      onChange={e => setClientEmail(e.target.value)} 
                      required={createNewClient} 
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={clientPhone} 
                      onChange={e => setClientPhone(e.target.value)} 
                    />
                  </div>
                  <div className="form-field">
                    <label>Portal Password *</label>
                    <input 
                      type="text" 
                      value={clientPassword} 
                      onChange={e => setClientPassword(e.target.value)} 
                      required={createNewClient} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PROJECT DETAILS */}
          <div className="form-card-section">
            <div className="section-header">
              <span className="section-icon">💼</span>
              <div>
                <h3>Project Information</h3>
                <p>Define title, package, description, stage, and deadline.</p>
              </div>
            </div>

            <div className="form-field">
              <label>Project Title *</label>
              <div className="input-with-icon">
                <span className="input-icon">📌</span>
                <input 
                  type="text" 
                  placeholder="e.g. Salon Website – Studio67" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
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
              <label>Description / Scope</label>
              <textarea 
                rows="3" 
                placeholder="Brief description of the project scope and deliverables..."
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
                <label>Deadline</label>
                <input 
                  type="date" 
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)} 
                />
              </div>

              <div className="form-field">
                <label>Total Price (₹)</label>
                <input 
                  type="number" 
                  step="500"
                  min="0"
                  value={paymentTotal} 
                  onChange={(e) => setPaymentTotal(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Paid Amount Now (₹)</label>
                <input 
                  type="number" 
                  step="500"
                  min="0"
                  value={paymentPaid} 
                  onChange={(e) => setPaymentPaid(e.target.value)} 
                />
              </div>

              <div className="form-field">
                <label>Payment Balance</label>
                <div className="payment-summary-box">
                  <span>Due Amount:</span>
                  <strong style={{ color: (Number(paymentTotal) - Number(paymentPaid)) > 0 ? '#ef4444' : '#16a34a' }}>
                    ₹{Math.max(0, Number(paymentTotal || 0) - Number(paymentPaid || 0)).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="form-actions-bar">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating...' : '🚀 Create Project Workspace'}
            </button>
            <Link to="/admin" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
