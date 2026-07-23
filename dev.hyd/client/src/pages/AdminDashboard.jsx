import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'
import Preloader from '../components/Preloader'

export default function AdminDashboard({ onLogout, onAdminEmulateClient }) {
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, enquiries, clients, projects, services, blogs, testimonials, gallery, analytics, settings
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // Inline edit state tracking
  const [editingItem, setEditingItem] = useState(null)
  const [projectUpdates, setProjectUpdates] = useState({})
  const [projectPayments, setProjectPayments] = useState({})
  const [projectFileUploads, setProjectFileUploads] = useState({})

  // Form states
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', price: '', icon: 'blue', order: 0 })
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 0 })
  const [testimonialForm, setTestimonialForm] = useState({ name: '', text: '', business: '', stars: 5, avatarFile: null, avatarUrl: '' })
  const [galleryForm, setGalleryForm] = useState({ title: '', category: 'Website', tags: '', imageFile: null, imageUrl: '' })
  
  const [settingsForm, setSettingsForm] = useState({
    siteName: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', github: '', whatsapp: '' }
  })

  const fetchDashboardData = () => {
    adminApi.getDashboard()
      .then(res => {
        setData(res.data)
        if (res.data.settings) {
          setSettingsForm({
            siteName: res.data.settings.siteName || '',
            seoTitle: res.data.settings.seoTitle || '',
            seoDescription: res.data.settings.seoDescription || '',
            seoKeywords: res.data.settings.seoKeywords || '',
            socialLinks: {
              facebook: res.data.settings.socialLinks?.facebook || '',
              instagram: res.data.settings.socialLinks?.instagram || '',
              twitter: res.data.settings.socialLinks?.twitter || '',
              linkedin: res.data.settings.socialLinks?.linkedin || '',
              github: res.data.settings.socialLinks?.github || '',
              whatsapp: res.data.settings.socialLinks?.whatsapp || ''
            }
          })
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogout = async () => {
    try {
      await adminApi.logout()
      onLogout()
      toast.success('Logged out successfully')
      navigate('/admin/login')
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  const handleViewClientPortal = async (clientId, redirectPath = '') => {
    try {
      const response = await adminApi.emulateClient(clientId)
      if (response.data.success) {
        onAdminEmulateClient({ id: clientId })
        toast.success('Emulating Client Portal')
        navigate(redirectPath || response.data.redirect)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Portal emulation failed')
    }
  }

  // Enquiry status change
  const handleEnquiryStatusChange = async (id, status) => {
    try {
      await adminApi.updateEnquiryStatus(id, status)
      toast.success('Status updated')
      fetchDashboardData()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleEnquiryDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return
    try {
      await adminApi.deleteEnquiry(id)
      toast.success('Enquiry deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Failed to delete enquiry')
    }
  }

  // Client delete
  const handleClientDelete = async (id) => {
    if (!window.confirm('Delete this client? This will delete all their projects as well.')) return
    try {
      await adminApi.deleteClient(id)
      toast.success('Client deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  // Project delete & updates
  const handleProjectDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await adminApi.deleteProject(id)
      toast.success('Project deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const handleProjectUpdate = async (e, projectId) => {
    e.preventDefault()
    const updateInfo = projectUpdates[projectId] || {}
    const status = updateInfo.status || 'Discovery'
    const note = updateInfo.note || ''

    try {
      await adminApi.addTimelineUpdate(projectId, status, note)
      setProjectUpdates(prev => ({
        ...prev,
        [projectId]: { ...prev[projectId], note: '' }
      }))
      toast.success('Project timeline updated')
      fetchDashboardData()
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const handlePaymentChange = async (e, projectId) => {
    e.preventDefault()
    const paymentInfo = projectPayments[projectId] || {}
    try {
      await adminApi.updatePayment(projectId, paymentInfo)
      toast.success('Payment details updated')
      fetchDashboardData()
    } catch (err) {
      toast.error('Payment update failed')
    }
  }

  const handleBlogPostDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await adminApi.deleteBlogPost(id)
      toast.success('Post deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Failed to delete post')
    }
  }

  // Services CRUD
  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem && editingItem.type === 'service') {
        await adminApi.updateService(editingItem.item.id || editingItem.item._id, serviceForm)
        toast.success('Service updated')
        setEditingItem(null)
      } else {
        await adminApi.createService(serviceForm)
        toast.success('Service created')
      }
      setServiceForm({ title: '', description: '', price: '', icon: 'blue', order: 0 })
      fetchDashboardData()
    } catch (err) {
      toast.error('Service operation failed')
    }
  }

  const handleServiceDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return
    try {
      await adminApi.deleteService(id)
      toast.success('Service deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  // FAQs CRUD
  const handleFaqSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem && editingItem.type === 'faq') {
        await adminApi.updateFAQ(editingItem.item.id || editingItem.item._id, faqForm)
        toast.success('FAQ updated')
        setEditingItem(null)
      } else {
        await adminApi.createFAQ(faqForm)
        toast.success('FAQ created')
      }
      setFaqForm({ question: '', answer: '', order: 0 })
      fetchDashboardData()
    } catch (err) {
      toast.error('FAQ operation failed')
    }
  }

  const handleFaqDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return
    try {
      await adminApi.deleteFAQ(id)
      toast.success('FAQ deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  // Testimonials CRUD
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', testimonialForm.name)
    formData.append('text', testimonialForm.text)
    formData.append('business', testimonialForm.business)
    formData.append('stars', testimonialForm.stars)
    if (testimonialForm.avatarFile) {
      formData.append('avatar', testimonialForm.avatarFile)
    } else {
      formData.append('avatar', testimonialForm.avatarUrl || '/images/avatar-default.png')
    }

    toast.loading('Saving testimonial...')
    try {
      if (editingItem && editingItem.type === 'testimonial') {
        await adminApi.updateTestimonial(editingItem.item.id || editingItem.item._id, formData)
        toast.dismiss()
        toast.success('Testimonial updated')
        setEditingItem(null)
      } else {
        await adminApi.createTestimonial(formData)
        toast.dismiss()
        toast.success('Testimonial created')
      }
      setTestimonialForm({ name: '', text: '', business: '', stars: 5, avatarFile: null, avatarUrl: '' })
      fetchDashboardData()
    } catch (err) {
      toast.dismiss()
      toast.error('Failed to save testimonial')
    }
  }

  const handleTestimonialDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      await adminApi.deleteTestimonial(id)
      toast.success('Testimonial deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  // Gallery CRUD
  const handleGallerySubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', galleryForm.title)
    formData.append('category', galleryForm.category)
    formData.append('tags', galleryForm.tags)
    if (galleryForm.imageFile) {
      formData.append('image', galleryForm.imageFile)
    } else {
      formData.append('image', galleryForm.imageUrl)
    }

    toast.loading('Saving gallery item...')
    try {
      if (editingItem && editingItem.type === 'gallery') {
        await adminApi.updateGalleryItem(editingItem.item.id || editingItem.item._id, formData)
        toast.dismiss()
        toast.success('Gallery item updated')
        setEditingItem(null)
      } else {
        await adminApi.createGalleryItem(formData)
        toast.dismiss()
        toast.success('Gallery item created')
      }
      setGalleryForm({ title: '', category: 'Website', tags: '', imageFile: null, imageUrl: '' })
      fetchDashboardData()
    } catch (err) {
      toast.dismiss()
      toast.error('Failed to save item')
    }
  }

  const handleGalleryDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await adminApi.deleteGalleryItem(id)
      toast.success('Gallery item deleted')
      fetchDashboardData()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  // Settings submit
  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminApi.updateSettings(settingsForm)
      toast.success('Settings updated successfully!')
      fetchDashboardData()
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  if (loading || !preloaderDone) {
    return (
      <Preloader 
        subtitle="Admin Control Center" 
        onFinish={() => setPreloaderDone(true)} 
      />
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#ef4444' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Error loading dashboard</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
        </div>
      </div>
    )
  }

  const { admin = {}, enquiries = [], clients = [], projects = [], posts = [], stats = {}, testimonials = [], services = [], faqs = [], galleryItems = [] } = data || {}

  const displayEnquiries = enquiries && enquiries.length > 0 ? enquiries : [
    { _id: '1', name: 'Neha Kapoor', service: 'Boutique Website', budget: '₹15,000', status: 'new', created_at: new Date(Date.now() - 2 * 60000) },
    { _id: '2', name: 'Arjun Mehta', service: 'Online Store', budget: '₹25,000', status: 'new', created_at: new Date(Date.now() - 15 * 60000) },
    { _id: '3', name: 'Priya Sharma', service: 'Business Website', budget: '₹8,000', status: 'contacted', created_at: new Date(Date.now() - 60 * 60000) },
    { _id: '4', name: 'Vikram Singh', service: 'Landing Page', budget: '₹5,000', status: 'converted', created_at: new Date(Date.now() - 180 * 60000) }
  ]

  const totalClientsCount = stats?.clients || (clients ? clients.length : 18)
  const activeProjectsCount = stats?.projects || (projects ? projects.length : 7)
  const newEnquiriesCount = stats?.newCount || 12

  return (
    <div className="admin-layout-v2">
      {/* REUSABLE PREMIUM ADMIN SIDEBAR COMPONENT */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId)
          setEditingItem(null)
        }}
        onLogout={handleLogout}
        user={{
          name: admin.name || 'Rithvik',
          role: 'Administrator',
          avatar: '/images/rithvik.png'
        }}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="admin-main-v2">
        {/* Topbar Header matching exact reference screenshot */}
        <div className="admin-topbar-v2">
          <div className="topbar-left-v2">
            <button className="menu-toggle-btn-v2" title="Toggle Sidebar" onClick={() => setMobileSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>

            <div className="topbar-search-v2">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="kbd-badge">⌘ K</span>
            </div>
          </div>

          <div className="topbar-actions-v2">
            <button className="action-icon-btn-v2" title="Notifications">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="badge-count">3</span>
            </button>
            
            <button className="action-icon-btn-v2" title="Messages">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span className="badge-count">7</span>
            </button>

            {/* Profile Pill at top right */}
            <div className="topbar-profile-pill-v2" onClick={handleLogout} title="Click to Logout">
              <img 
                src="/images/rithvik.png" 
                onError={(e) => { e.target.src = '/images/avatar-default.png' }}
                alt="Admin" 
              />
              <div className="user-info">
                <div className="user-name">{admin.name || 'Rithvik'}</div>
                <div className="user-role">Administrator</div>
              </div>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        {/* DASHBOARD TAB CONTENT */}
        {activeTab === 'dashboard' && (
          <>
            {/* Greeting Row */}
            <div className="admin-greeting-row-v2">
              <div className="greeting-text-v2">
                <h2>Good Morning,</h2>
                <h1>{admin.name || 'Rithvik'} 👋</h1>
                <p>Here's what's happening with your business today.</p>
              </div>

              <div className="date-pill-v2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>May 24, 2025</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            {/* 4 Metric Stats Cards */}
            <div className="metrics-grid-v2">
              <div className="metric-card-v2">
                <div className="metric-icon-box-v2">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="metric-details-v2">
                  <div className="label">New Enquiries</div>
                  <div className="value">{newEnquiriesCount}</div>
                  <div className="trend">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                    <span>20% from yesterday</span>
                  </div>
                </div>
              </div>

              <div className="metric-card-v2">
                <div className="metric-icon-box-v2">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <div className="metric-details-v2">
                  <div className="label">Active Clients</div>
                  <div className="value">{totalClientsCount}</div>
                  <div className="trend">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                    <span>12% from last month</span>
                  </div>
                </div>
              </div>

              <div className="metric-card-v2">
                <div className="metric-icon-box-v2">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="metric-details-v2">
                  <div className="label">Running Projects</div>
                  <div className="value">{activeProjectsCount}</div>
                  <div className="trend">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                    <span>15% from last month</span>
                  </div>
                </div>
              </div>

              <div className="metric-card-v2">
                <div className="metric-icon-box-v2" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  ₹
                </div>
                <div className="metric-details-v2">
                  <div className="label">Revenue This Month</div>
                  <div className="value">₹85,000</div>
                  <div className="trend">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                    <span>18% from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Revenue Overview Chart + Recent Enquiries */}
            <div className="dashboard-grid-2col">
              <div className="v2-card">
                <div className="v2-card-header" style={{ marginBottom: '0.75rem' }}>
                  <h3>Revenue Overview</h3>
                  <select className="header-select">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Year</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>₹85,000</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Revenue</span>
                  <span className="v2-badge converted">↑ 18%</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <svg viewBox="0 0 600 200" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5500" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ff5500" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="50" y1="20" x2="570" y2="20" stroke="#f1f5f9" strokeDasharray="4" />
                    <text x="35" y="24" fontSize="11" fill="#94a3b8" textAnchor="end">₹100k</text>

                    <line x1="50" y1="60" x2="570" y2="60" stroke="#f1f5f9" strokeDasharray="4" />
                    <text x="35" y="64" fontSize="11" fill="#94a3b8" textAnchor="end">₹75k</text>

                    <line x1="50" y1="100" x2="570" y2="100" stroke="#f1f5f9" strokeDasharray="4" />
                    <text x="35" y="104" fontSize="11" fill="#94a3b8" textAnchor="end">₹50k</text>

                    <line x1="50" y1="140" x2="570" y2="140" stroke="#f1f5f9" strokeDasharray="4" />
                    <text x="35" y="144" fontSize="11" fill="#94a3b8" textAnchor="end">₹25k</text>

                    <line x1="50" y1="180" x2="570" y2="180" stroke="#e2e8f0" />
                    <text x="35" y="184" fontSize="11" fill="#94a3b8" textAnchor="end">₹0</text>

                    <text x="60" y="198" fontSize="11" fill="#94a3b8">May 1</text>
                    <text x="180" y="198" fontSize="11" fill="#94a3b8">May 8</text>
                    <text x="300" y="198" fontSize="11" fill="#94a3b8">May 15</text>
                    <text x="420" y="198" fontSize="11" fill="#94a3b8">May 22</text>
                    <text x="540" y="198" fontSize="11" fill="#94a3b8">May 29</text>

                    <path
                      d="M 60 180 Q 120 120, 180 130 T 300 100 T 420 44 T 540 70 L 540 180 Z"
                      fill="url(#orangeAreaGrad)"
                    />

                    <path
                      d="M 60 180 Q 120 120, 180 130 T 300 100 T 420 44 T 540 70"
                      fill="none"
                      stroke="#ff5500"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    <circle cx="420" cy="44" r="5" fill="#ff5500" stroke="#ffffff" strokeWidth="2" />

                    <g transform="translate(380, 5)">
                      <rect x="0" y="0" width="80" height="34" rx="8" fill="#ffffff" stroke="#cbd5e1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))" />
                      <text x="40" y="14" fontSize="9" fill="#64748b" textAnchor="middle">May 22</text>
                      <text x="40" y="27" fontSize="11" fontWeight="700" fill="#0f172a" textAnchor="middle">₹85,000</text>
                    </g>
                  </svg>
                </div>
              </div>

              <div className="v2-card">
                <div className="v2-card-header">
                  <h3>Recent Enquiries</h3>
                  <button className="header-action" onClick={() => setActiveTab('enquiries')}>View All</button>
                </div>

                <div className="enquiry-list-v2">
                  {displayEnquiries.slice(0, 4).map((enq, idx) => {
                    const avatarUrl = idx === 0 ? '/images/avatar-neha.png' : idx === 1 ? '/images/avatar-karthik.png' : idx === 2 ? '/images/avatar-anjali.png' : '/images/avatar-default.png'
                    const statusClass = enq.status === 'new' ? 'new' : enq.status === 'contacted' ? 'contacted' : enq.status === 'converted' ? 'converted' : 'closed'
                    const statusText = enq.status === 'new' ? 'New' : enq.status === 'contacted' ? 'Contacted' : enq.status === 'converted' ? 'Converted' : 'Closed'
                    const timeText = idx === 0 ? '2m ago' : idx === 1 ? '15m ago' : idx === 2 ? '1h ago' : '3h ago'

                    return (
                      <div className="enquiry-item-v2" key={enq._id || idx}>
                        <div className="enquiry-user-v2">
                          <img 
                            src={avatarUrl} 
                            onError={(e) => { e.target.src = '/images/avatar-default.png' }}
                            alt={enq.name} 
                            className="enquiry-avatar-v2"
                          />
                          <div className="enquiry-user-info-v2">
                            <div className="name">{enq.name}</div>
                            <div className="sub">{enq.service}</div>
                          </div>
                        </div>

                        <div className="enquiry-meta-v2">
                          <div className="amount">{enq.budget || '₹15,000'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                            <span className={`v2-badge ${statusClass}`}>{statusText}</span>
                            <span className="budget-lbl">{timeText}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button 
                  onClick={() => setActiveTab('enquiries')}
                  style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, color: '#ff5500', cursor: 'pointer' }}
                >
                  View All Enquiries →
                </button>
              </div>
            </div>

            {/* Bottom Section: Projects Overview + Top Services + Quick Actions */}
            <div className="dashboard-grid-3col">
              <div className="v2-card">
                <div className="v2-card-header">
                  <h3>Projects Overview</h3>
                  <button className="header-action" onClick={() => setActiveTab('projects')}>View All</button>
                </div>

                <div className="donut-container-v2">
                  <svg className="donut-chart-svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#22c55e" strokeWidth="16" strokeDasharray="238" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="238" strokeDashoffset="24" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#eab308" strokeWidth="16" strokeDasharray="238" strokeDashoffset="65" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ff5500" strokeWidth="16" strokeDasharray="238" strokeDashoffset="144" transform="rotate(-90 50 50)" />
                  </svg>

                  <div className="donut-legend-v2">
                    <div className="legend-item-v2">
                      <div className="legend-label-v2">
                        <span className="legend-dot-v2" style={{ background: '#ff5500' }}></span>
                        Completed
                      </div>
                      <div className="legend-val-v2">12 (40%)</div>
                    </div>

                    <div className="legend-item-v2">
                      <div className="legend-label-v2">
                        <span className="legend-dot-v2" style={{ background: '#eab308' }}></span>
                        In Progress
                      </div>
                      <div className="legend-val-v2">10 (33%)</div>
                    </div>

                    <div className="legend-item-v2">
                      <div className="legend-label-v2">
                        <span className="legend-dot-v2" style={{ background: '#3b82f6' }}></span>
                        Pending
                      </div>
                      <div className="legend-val-v2">5 (17%)</div>
                    </div>

                    <div className="legend-item-v2">
                      <div className="legend-label-v2">
                        <span className="legend-dot-v2" style={{ background: '#22c55e' }}></span>
                        On Hold
                      </div>
                      <div className="legend-val-v2">3 (10%)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="v2-card">
                <div className="v2-card-header">
                  <h3>Top Services</h3>
                  <button className="header-action" onClick={() => setActiveTab('services')}>View All</button>
                </div>

                <div className="services-list-v2">
                  <div className="service-item-v2">
                    <div className="service-info-v2">
                      <div className="service-icon-v2">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      </div>
                      <div className="service-title-v2">Business Website</div>
                    </div>
                    <div className="service-count-v2">12 Projects</div>
                  </div>

                  <div className="service-item-v2">
                    <div className="service-info-v2">
                      <div className="service-icon-v2" style={{ background: '#fff1f2', color: '#f43f5e' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      </div>
                      <div className="service-title-v2">Online Store</div>
                    </div>
                    <div className="service-count-v2">8 Projects</div>
                  </div>

                  <div className="service-item-v2">
                    <div className="service-info-v2">
                      <div className="service-icon-v2" style={{ background: '#fff7ed', color: '#ea580c' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </div>
                      <div className="service-title-v2">Social Media Management</div>
                    </div>
                    <div className="service-count-v2">6 Projects</div>
                  </div>

                  <div className="service-item-v2">
                    <div className="service-info-v2">
                      <div className="service-icon-v2" style={{ background: '#fff7ed', color: '#ff5500' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      </div>
                      <div className="service-title-v2">Logo & Branding</div>
                    </div>
                    <div className="service-count-v2">4 Projects</div>
                  </div>
                </div>
              </div>

              <div className="v2-card">
                <div className="v2-card-header">
                  <h3>Quick Actions</h3>
                </div>

                <div className="quick-actions-grid-v2">
                  <button className="quick-action-btn-v2" onClick={() => setActiveTab('enquiries')}>
                    <div className="service-icon-v2" style={{ background: '#fff1f2', color: '#f43f5e', border: 'none' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <span>New Enquiry</span>
                  </button>

                  <Link to="/admin/projects/new" className="quick-action-btn-v2">
                    <div className="service-icon-v2" style={{ background: '#fff7ed', color: '#ea580c', border: 'none' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </div>
                    <span>Add Project</span>
                  </Link>

                  <Link to="/admin/clients/new" className="quick-action-btn-v2">
                    <div className="service-icon-v2" style={{ background: '#fff7ed', color: '#ff5500', border: 'none' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    </div>
                    <span>Add Client</span>
                  </Link>

                  <Link to="/admin/blog/new" className="quick-action-btn-v2">
                    <div className="service-icon-v2" style={{ background: '#fff7ed', color: '#ea580c', border: 'none' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </div>
                    <span>New Blog Post</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div className="v2-card">
            <div className="v2-card-header">
              <h3>All Enquiries ({enquiries.length})</h3>
            </div>
            {enquiries.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No enquiries found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Business</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map(e => {
                      const eId = e.id || e._id
                      return (
                        <tr key={eId}>
                          <td>
                            <strong>{e.name}</strong><br />
                            <small style={{ color: '#64748b' }}>{e.email || ''}</small>
                          </td>
                          <td>{e.business || '—'}</td>
                          <td>
                            <a href={`https://wa.me/91${(e.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#ff5500', fontWeight: 600 }}>
                              {e.phone}
                            </a>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>{e.service}</td>
                          <td style={{ fontSize: '0.82rem' }}>{e.budget || '—'}</td>
                          <td>
                            <span className={`v2-badge ${e.status === 'new' ? 'new' : e.status === 'contacted' ? 'contacted' : e.status === 'converted' ? 'converted' : 'closed'}`}>{e.status}</span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {e.created_at || e.createdAt ? new Date(e.created_at || e.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td>
                            <select 
                              value={e.status} 
                              onChange={(evt) => handleEnquiryStatusChange(eId, evt.target.value)} 
                              style={{ fontSize: '0.78rem', padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="converted">Converted</option>
                              <option value="closed">Closed</option>
                            </select>
                            <button 
                              onClick={() => handleEnquiryDelete(eId)} 
                              className="btn btn-sm btn-danger" 
                              style={{ marginLeft: '0.4rem', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px' }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div className="v2-card">
            <div className="v2-card-header">
              <h3>All Registered Clients ({clients.length})</h3>
              <Link to="/admin/clients/new" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '8px' }}>+ New Client</Link>
            </div>
            {clients.length === 0 ? (
              <p style={{ color: '#64748b' }}>No clients registered.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => {
                      const cId = c.id || c._id
                      return (
                        <tr key={cId}>
                          <td><strong>{c.name}</strong></td>
                          <td>{c.email}</td>
                          <td>{c.phone || '—'}</td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {c.created_at || c.createdAt ? new Date(c.created_at || c.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td>
                            <button onClick={() => handleViewClientPortal(cId)} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Portal View
                            </button>
                            <button onClick={() => handleClientDelete(cId)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem', padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="v2-card">
            <div className="v2-card-header">
              <h3>Projects ({projects.length})</h3>
              <Link to="/admin/projects/new" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '8px' }}>+ New Project</Link>
            </div>
            {projects.length === 0 ? (
              <p style={{ color: '#64748b' }}>No active projects found.</p>
            ) : (
              <div>
                {projects.map(p => {
                  const pId = p.id || p._id
                  const client = p.client || p.client_id || {}
                  return (
                    <div key={pId} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{p.title}</h3>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Client: <strong>{client.name || 'Unknown'}</strong> ({client.email || ''})</span>
                        </div>
                        <span className={`badge ${p.status}`}>{p.status}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', margin: '0.75rem 0', color: '#475569' }}>{p.description || 'No description provided.'}</p>
                      
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span>📦 Package: <strong>{p.package || 'Custom'}</strong></span>
                        {p.deadline && <span>📅 Deadline: <strong>{new Date(p.deadline).toLocaleDateString('en-IN')}</strong></span>}
                        <span>💰 Payment: <strong style={{ color: (p.paymentStatus || p.payment_status) === 'Paid' ? '#16a34a' : '#ff5500' }}>{p.paymentStatus || p.payment_status}</strong> (Paid ₹{p.paymentAmountPaid ?? p.payment_amount_paid ?? 0} / ₹{p.paymentAmountTotal ?? p.payment_amount_total ?? 0})</span>
                      </div>

                      {/* Timeline update form */}
                      <form onSubmit={(e) => handleProjectUpdate(e, pId)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Update Status:</label>
                        <select 
                          value={projectUpdates[pId]?.status || p.status} 
                          onChange={(e) => setProjectUpdates(prev => ({ ...prev, [pId]: { ...(prev[pId] || {}), status: e.target.value } }))}
                          style={{ fontSize: '0.78rem', padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        >
                          {['Discovery', 'Design', 'Development', 'Review', 'Delivered'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          placeholder="Update timeline note..." 
                          value={projectUpdates[pId]?.note || ''} 
                          onChange={(e) => setProjectUpdates(prev => ({ ...prev, [pId]: { ...(prev[pId] || {}), note: e.target.value } }))}
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', flex: 1, minWidth: '150px' }}
                        />
                        <button className="btn btn-sm btn-success" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px' }}>Save Status</button>
                      </form>

                      {/* Payment update */}
                      <form onSubmit={(e) => handlePaymentChange(e, pId)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Payments:</label>
                        <select 
                          value={projectPayments[pId]?.payment_status || p.paymentStatus || p.payment_status} 
                          onChange={(e) => setProjectPayments(prev => ({ ...prev, [pId]: { ...(prev[pId] || {}), payment_status: e.target.value } }))}
                          style={{ fontSize: '0.78rem', padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                        </select>
                        <input 
                          type="number" 
                          step="500"
                          min="0"
                          placeholder="Total Amount" 
                          value={projectPayments[pId]?.total !== undefined ? projectPayments[pId]?.total : (p.paymentAmountTotal ?? p.payment_amount_total ?? 0)} 
                          onChange={(e) => setProjectPayments(prev => ({ ...prev, [pId]: { ...(prev[pId] || {}), total: Number(e.target.value) } }))}
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', width: '110px' }}
                        />
                        <input 
                          type="number" 
                          step="500"
                          min="0"
                          placeholder="Paid Amount" 
                          value={projectPayments[pId]?.paid !== undefined ? projectPayments[pId]?.paid : (p.paymentAmountPaid ?? p.payment_amount_paid ?? 0)} 
                          onChange={(e) => setProjectPayments(prev => ({ ...prev, [pId]: { ...(prev[pId] || {}), paid: Number(e.target.value) } }))}
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', width: '110px' }}
                        />
                        <button className="btn btn-sm btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px' }}>Update Money</button>
                        <button type="button" onClick={() => handleProjectDelete(pId)} className="btn btn-sm btn-danger" style={{ marginLeft: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px' }}>Delete Project</button>
                      </form>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. BLOGS TAB */}
        {activeTab === 'blogs' && (
          <div className="v2-card">
            <div className="v2-card-header">
              <h3>Blog Posts ({posts.length})</h3>
              <Link to="/admin/blog/new" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '8px' }}>+ New Post</Link>
            </div>
            {posts.length === 0 ? (
              <p style={{ color: '#64748b' }}>No blogs written yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(p => {
                      const pId = p.id || p._id
                      return (
                        <tr key={pId}>
                          <td><strong>{p.title}</strong></td>
                          <td>
                            <span className={`v2-badge ${p.published ? 'converted' : 'new'}`}>
                              {p.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {p.created_at || p.createdAt ? new Date(p.created_at || p.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td>
                            <Link to={`/blog/${p.slug}`} target="_blank" className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>View</Link>
                            <button onClick={() => handleBlogPostDelete(pId)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem', padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. SERVICES TAB */}
        {activeTab === 'services' && (
          <div>
            <div className="v2-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{editingItem && editingItem.type === 'service' ? '✏️ Edit Service' : '➕ Add Service'}</h3>
              <form onSubmit={handleServiceSubmit} className="admin-form" style={{ maxWidth: '100%', border: 'none', padding: 0, marginTop: '1rem' }}>
                <div className="form-field">
                  <label>Service Title *</label>
                  <input 
                    type="text" 
                    value={serviceForm.title} 
                    onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} 
                    placeholder="e.g. E-Commerce Website" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea 
                    value={serviceForm.description} 
                    onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} 
                    placeholder="Describe what is included..."
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-field">
                    <label>Price Display *</label>
                    <input 
                      type="text" 
                      value={serviceForm.price} 
                      onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} 
                      placeholder="e.g. From ₹10,000" 
                      required 
                    />
                  </div>
                  <div className="form-field">
                    <label>Icon Theme</label>
                    <select value={serviceForm.icon} onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}>
                      <option value="blue">Blue (Website)</option>
                      <option value="orange">Orange (Store)</option>
                      <option value="red">Red (Social Media)</option>
                      <option value="orange-light">Light Orange (Branding)</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Order Position</label>
                    <input 
                      type="number" 
                      value={serviceForm.order} 
                      onChange={e => setServiceForm({ ...serviceForm, order: Number(e.target.value) })} 
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>{editingItem && editingItem.type === 'service' ? 'Save Service' : 'Create Service'}</button>
                  {editingItem && (
                    <button type="button" className="btn btn-outline" style={{ borderRadius: '8px' }} onClick={() => {
                      setEditingItem(null)
                      setServiceForm({ title: '', description: '', price: '', icon: 'blue', order: 0 })
                    }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="v2-card">
              <h3>Current Services</h3>
              {services.length === 0 ? (
                <p style={{ color: '#64748b' }}>No services added.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Theme</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(s => {
                      const sId = s.id || s._id
                      return (
                        <tr key={sId}>
                          <td><strong>{s.title}</strong><br /><small style={{ color: '#64748b' }}>{s.description?.slice(0,60)}...</small></td>
                          <td>{s.price}</td>
                          <td><span className="v2-badge new">{s.icon}</span></td>
                          <td>{s.order}</td>
                          <td>
                            <button onClick={() => {
                              setEditingItem({ type: 'service', item: s })
                              setServiceForm({ title: s.title, description: s.description, price: s.price, icon: s.icon, order: s.order })
                            }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Edit
                            </button>
                            <button onClick={() => handleServiceDelete(sId)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem', padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 7. TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="v2-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{editingItem && editingItem.type === 'testimonial' ? '✏️ Edit Testimonial' : '➕ Add Testimonial'}</h3>
              <form onSubmit={handleTestimonialSubmit} className="admin-form" style={{ maxWidth: '100%', border: 'none', padding: 0, marginTop: '1rem' }}>
                <div className="form-field">
                  <label>Client Name *</label>
                  <input 
                    type="text" 
                    value={testimonialForm.name} 
                    onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} 
                    placeholder="e.g. Anjali Verma" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Client Business (Optional)</label>
                  <input 
                    type="text" 
                    value={testimonialForm.business} 
                    onChange={e => setTestimonialForm({ ...testimonialForm, business: e.target.value })} 
                    placeholder="e.g. Luxury Unisex Salon" 
                  />
                </div>
                <div className="form-field">
                  <label>Testimonial Text *</label>
                  <textarea 
                    value={testimonialForm.text} 
                    onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })} 
                    placeholder="Rithvik did a great job..." 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }} className="form-field">
                  <div>
                    <label>Stars Rating (1-5)</label>
                    <select value={testimonialForm.stars} onChange={e => setTestimonialForm({ ...testimonialForm, stars: Number(e.target.value) })}>
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                      <option value="3">⭐⭐⭐ (3 Stars)</option>
                      <option value="2">⭐⭐ (2 Stars)</option>
                      <option value="1">⭐ (1 Star)</option>
                    </select>
                  </div>
                  <div>
                    <label>Avatar Photo</label>
                    <input 
                      type="file" 
                      onChange={e => setTestimonialForm({ ...testimonialForm, avatarFile: e.target.files[0] })} 
                    />
                    <input 
                      type="text" 
                      placeholder="Or enter Avatar Image URL..." 
                      value={testimonialForm.avatarUrl}
                      onChange={e => setTestimonialForm({ ...testimonialForm, avatarUrl: e.target.value })}
                      style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>Save Testimonial</button>
                  {editingItem && (
                    <button type="button" className="btn btn-outline" style={{ borderRadius: '8px' }} onClick={() => {
                      setEditingItem(null)
                      setTestimonialForm({ name: '', text: '', business: '', stars: 5, avatarFile: null, avatarUrl: '' })
                    }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="v2-card">
              <h3>Current Testimonials</h3>
              {testimonials.length === 0 ? (
                <p style={{ color: '#64748b' }}>No testimonials yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Name / Business</th>
                      <th>Rating</th>
                      <th>Quote</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map(t => {
                      const tId = t.id || t._id
                      return (
                        <tr key={tId}>
                          <td>
                            <img src={t.avatar} alt={t.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          </td>
                          <td><strong>{t.name}</strong><br /><small style={{ color: '#64748b' }}>{t.business}</small></td>
                          <td>{'★'.repeat(t.stars)}</td>
                          <td style={{ fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '300px' }}>{t.text}</td>
                          <td>
                            <button onClick={() => {
                              setEditingItem({ type: 'testimonial', item: t })
                              setTestimonialForm({ name: t.name, text: t.text, business: t.business, stars: t.stars, avatarUrl: t.avatar, avatarFile: null })
                            }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Edit
                            </button>
                            <button onClick={() => handleTestimonialDelete(tId)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem', padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 8. GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div>
            <div className="v2-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{editingItem && editingItem.type === 'gallery' ? '✏️ Edit Showcase Project' : '➕ Add Showcase Project'}</h3>
              <form onSubmit={handleGallerySubmit} className="admin-form" style={{ maxWidth: '100%', border: 'none', padding: 0, marginTop: '1rem' }}>
                <div className="form-field">
                  <label>Project Title *</label>
                  <input 
                    type="text" 
                    value={galleryForm.title} 
                    onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} 
                    placeholder="e.g. Modern Bistro Website" 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-field">
                    <label>Category</label>
                    <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}>
                      <option value="Website">Website</option>
                      <option value="Store">Online Store</option>
                      <option value="Branding">Branding</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Tags (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={galleryForm.tags} 
                      onChange={e => setGalleryForm({ ...galleryForm, tags: e.target.value })} 
                      placeholder="e.g. Website, Gallery, Catalog" 
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Project Image *</label>
                  <input 
                    type="file" 
                    onChange={e => setGalleryForm({ ...galleryForm, imageFile: e.target.files[0] })} 
                  />
                  <input 
                    type="text" 
                    placeholder="Or enter Image URL..." 
                    value={galleryForm.imageUrl}
                    onChange={e => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                    style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>Save Project</button>
                  {editingItem && (
                    <button type="button" className="btn btn-outline" style={{ borderRadius: '8px' }} onClick={() => {
                      setEditingItem(null)
                      setGalleryForm({ title: '', category: 'Website', tags: '', imageFile: null, imageUrl: '' })
                    }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="v2-card">
              <h3>Current Showcase Items</h3>
              {galleryItems.length === 0 ? (
                <p style={{ color: '#64748b' }}>No portfolio items.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Project Title</th>
                      <th>Category</th>
                      <th>Tags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {galleryItems.map(g => {
                      const gId = g.id || g._id
                      return (
                        <tr key={gId}>
                          <td>
                            <img src={g.image} alt={g.title} style={{ width: '60px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                          </td>
                          <td><strong>{g.title}</strong></td>
                          <td>{g.category}</td>
                          <td>
                            {Array.isArray(g.tags) ? g.tags.map(tag => (
                              <span key={tag} style={{ background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', marginRight: '0.2rem', fontWeight: 600 }}>{tag}</span>
                            )) : null}
                          </td>
                          <td>
                            <button onClick={() => {
                              setEditingItem({ type: 'gallery', item: g })
                              setGalleryForm({ title: g.title, category: g.category, tags: Array.isArray(g.tags) ? g.tags.join(', ') : '', imageUrl: g.image, imageFile: null })
                            }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Edit
                            </button>
                            <button onClick={() => handleGalleryDelete(gId)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem', padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 9. FAQs TAB */}
        {activeTab === 'faqs' && (
          <div>
            <div className="v2-card" style={{ marginBottom: '1.5rem' }}>
              <h3>{editingItem && editingItem.type === 'faq' ? '✏️ Edit FAQ' : '➕ Add FAQ'}</h3>
              <form onSubmit={handleFaqSubmit} className="admin-form" style={{ maxWidth: '100%', border: 'none', padding: 0, marginTop: '1rem' }}>
                <div className="form-field">
                  <label>Question *</label>
                  <input 
                    type="text" 
                    value={faqForm.question} 
                    onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} 
                    placeholder="e.g. Do you provide hosting?" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Answer *</label>
                  <textarea 
                    value={faqForm.answer} 
                    onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} 
                    placeholder="Yes, I provide..." 
                    required 
                  />
                </div>
                <div className="form-field" style={{ width: '150px' }}>
                  <label>Order Index</label>
                  <input 
                    type="number" 
                    value={faqForm.order} 
                    onChange={e => setFaqForm({ ...faqForm, order: Number(e.target.value) })} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>Save FAQ</button>
                  {editingItem && (
                    <button type="button" className="btn btn-outline" style={{ borderRadius: '8px' }} onClick={() => {
                      setEditingItem(null)
                      setFaqForm({ question: '', answer: '', order: 0 })
                    }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="v2-card">
              <h3>Current FAQs</h3>
              {faqs.length === 0 ? (
                <p style={{ color: '#64748b' }}>No FAQs yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Answer</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map(f => {
                      const fId = f.id || f._id
                      return (
                        <tr key={fId}>
                          <td><strong>{f.question}</strong></td>
                          <td style={{ fontSize: '0.8rem', maxWidth: '350px' }}>{f.answer}</td>
                          <td>{f.order}</td>
                          <td>
                            <button onClick={() => {
                              setEditingItem({ type: 'faq', item: f })
                              setFaqForm({ question: f.question, answer: f.answer, order: f.order })
                            }} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Edit
                            </button>
                            <button onClick={() => handleFaqDelete(fId)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.4rem', padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 10. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="v2-card">
            <div className="v2-card-header">
              <h3>Analytics Overview</h3>
            </div>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Track visitor stats, conversion rates, and revenue metrics across your website.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.35rem' }}>Monthly Pageviews</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>24,850</div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>↑ 28% from last month</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.35rem' }}>Conversion Rate</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>4.2%</div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>↑ 1.5% from last month</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.35rem' }}>Avg. Session Duration</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>3m 42s</div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>↑ 12s from last month</div>
              </div>
            </div>
          </div>
        )}

        {/* 11. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="v2-card">
            <h3>Website Global Settings</h3>
            <form onSubmit={handleSettingsSubmit} className="admin-form" style={{ maxWidth: '100%', border: 'none', padding: 0, marginTop: '1rem' }}>
              
              <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '1rem', color: '#0f172a' }}>🌐 General</h4>
              <div className="form-field">
                <label>Site Brand Name</label>
                <input 
                  type="text" 
                  value={settingsForm.siteName} 
                  onChange={e => setSettingsForm({ ...settingsForm, siteName: e.target.value })} 
                  placeholder="e.g. dev.hyd" 
                />
              </div>

              <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '1rem', marginTop: '1.5rem', color: '#0f172a' }}>🔍 SEO Metadata</h4>
              <div className="form-field">
                <label>SEO Title Tag</label>
                <input 
                  type="text" 
                  value={settingsForm.seoTitle} 
                  onChange={e => setSettingsForm({ ...settingsForm, seoTitle: e.target.value })} 
                  placeholder="Title shown in browser tab" 
                />
              </div>
              <div className="form-field">
                <label>SEO Meta Description</label>
                <textarea 
                  value={settingsForm.seoDescription} 
                  onChange={e => setSettingsForm({ ...settingsForm, seoDescription: e.target.value })} 
                  placeholder="Description shown in search engine snippets" 
                />
              </div>
              <div className="form-field">
                <label>SEO Meta Keywords (Comma-separated)</label>
                <input 
                  type="text" 
                  value={settingsForm.seoKeywords} 
                  onChange={e => setSettingsForm({ ...settingsForm, seoKeywords: e.target.value })} 
                  placeholder="e.g. web designer Hyderabad, local business website" 
                />
              </div>

              <h4 style={{ fontSize: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '1rem', marginTop: '1.5rem', color: '#0f172a' }}>📱 Social Media Links</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-field">
                  <label>WhatsApp Booking URL</label>
                  <input 
                    type="text" 
                    value={settingsForm.socialLinks.whatsapp} 
                    onChange={e => setSettingsForm({ ...settingsForm, socialLinks: { ...settingsForm.socialLinks, whatsapp: e.target.value } })} 
                    placeholder="e.g. https://wa.me/917780252258" 
                  />
                </div>
                <div className="form-field">
                  <label>Instagram URL</label>
                  <input 
                    type="text" 
                    value={settingsForm.socialLinks.instagram} 
                    onChange={e => setSettingsForm({ ...settingsForm, socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value } })} 
                    placeholder="e.g. https://instagram.com/dev.hyd" 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', borderRadius: '8px' }}>Save Settings</button>
            </form>
          </div>
        )}

      </main>
    </div>
  )
}
