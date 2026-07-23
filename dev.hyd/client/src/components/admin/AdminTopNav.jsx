import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  Plus,
  ChevronDown,
  Menu,
  Sparkles,
  ExternalLink,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminTopNav({
  activeTab = 'dashboard',
  searchQuery = '',
  onSearchChange = () => {},
  onToggleMobileSidebar = () => {},
  onLogout = () => {},
  user = { name: 'Rithvik', role: 'Administrator', avatar: '/images/rithvik.png' },
  onSelectTab = () => {}
}) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const tabTitles = {
    dashboard: 'Dashboard Command Center',
    enquiries: 'Client Enquiries & Leads',
    clients: 'Client Directory & Accounts',
    projects: 'Project Pipeline & Tracker',
    services: 'Services & Offerings',
    gallery: 'Portfolio Showcase Gallery',
    testimonials: 'Client Testimonials & Reviews',
    blogs: 'Blog CMS & Content Manager',
    analytics: 'Analytics & Revenue Reports',
    settings: 'Global System Settings'
  }

  const notifications = [
    { id: 1, title: 'New High-Value Enquiry', sub: 'Neha Kapoor requested Boutique Website quote', time: '2m ago', unread: true },
    { id: 2, title: 'Project Status Updated', sub: 'Arjun Mehta store moved to Development', time: '45m ago', unread: true },
    { id: 3, title: 'Payment Received', sub: '₹25,000 received for Corporate Redesign', time: '2h ago', unread: false }
  ]

  return (
    <header
      style={{
        height: '72px',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.75rem',
        position: 'sticky',
        top: '1rem',
        zIndex: 40
      }}
    >
      {/* LEFT: MOBILE TOGGLE, BREADCRUMB & TITLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleMobileSidebar}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="mobile-only-btn"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '2px'
            }}
          >
            <span>Admin</span>
            <span>/</span>
            <span style={{ color: '#FF5A1F', textTransform: 'capitalize', fontWeight: 700 }}>
              {activeTab}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {tabTitles[activeTab] || 'Admin Dashboard'}
          </h1>
        </div>
      </div>

      {/* RIGHT: SEARCH, STATUS, NOTIFICATIONS, QUICK ACTIONS & PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        {/* SEARCH BAR */}
        <div
          style={{
            position: 'relative',
            width: '260px'
          }}
          className="desktop-search"
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8'
            }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              paddingLeft: '2.5rem',
              paddingRight: '3.2rem',
              fontSize: '0.84rem',
              color: '#0F172A',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '0.1rem 0.4rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748B'
            }}
          >
            ⌘K
          </span>
        </div>

        {/* SYSTEM STATUS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '0.35rem 0.8rem',
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#475569'
          }}
          className="desktop-only-status"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981'
            }}
          />
          <span>Operational</span>
        </div>

        {/* NOTIFICATIONS BUTTON */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
            title="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#FF5A1F',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF'
              }}
            >
              2
            </span>
          </button>

          {/* NOTIFICATION POPUP DROPDOWN */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '320px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.12)',
                  padding: '1rem',
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Notifications</h4>
                  <span style={{ fontSize: '0.72rem', color: '#FF5A1F', fontWeight: 700, cursor: 'pointer' }}>Mark all read</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '10px',
                        background: n.unread ? '#FFF4ED' : '#F8FAFC',
                        border: '1px solid',
                        borderColor: n.unread ? 'rgba(255, 90, 31, 0.2)' : '#E2E8F0'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{n.sub}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* QUICK CREATE BUTTON */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            style={{
              height: '40px',
              padding: '0 1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF5A1F 0%, #FF3300 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(255, 90, 31, 0.3)'
            }}
          >
            <Plus size={16} />
            <span>Create</span>
            <ChevronDown size={14} />
          </motion.button>

          <AnimatePresence>
            {quickCreateOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '180px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.1)',
                  padding: '0.4rem',
                  zIndex: 100
                }}
              >
                <Link
                  to="/admin/projects/new"
                  onClick={() => setQuickCreateOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    textDecoration: 'none'
                  }}
                  className="dropdown-item-hover"
                >
                  📁 New Project
                </Link>
                <Link
                  to="/admin/clients/new"
                  onClick={() => setQuickCreateOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    textDecoration: 'none'
                  }}
                  className="dropdown-item-hover"
                >
                  👥 New Client
                </Link>
                <Link
                  to="/admin/blog/new"
                  onClick={() => setQuickCreateOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    textDecoration: 'none'
                  }}
                  className="dropdown-item-hover"
                >
                  ✍️ New Blog Post
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ADMIN PROFILE TRIGGER */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <img
              src={user.avatar || '/images/rithvik.png'}
              onError={(e) => {
                e.target.src = '/images/avatar-default.png'
              }}
              alt={user.name}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #E2E8F0'
              }}
            />
          </div>

          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '200px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.1)',
                  padding: '0.5rem',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{user.role}</div>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    onSelectTab('settings')
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  className="dropdown-item-hover"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    onLogout()
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#FF5A1F',
                    background: '#FFF4ED',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.3rem'
                  }}
                >
                  🚪 Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
