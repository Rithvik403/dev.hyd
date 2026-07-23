import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FolderKanban,
  Layers,
  FileText,
  Star,
  Image,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react'

export default function AdminSidebar({
  activeTab = 'dashboard',
  onSelectTab = () => {},
  onLogout = () => {},
  user = { name: 'Rithvik', role: 'Administrator', avatar: '/images/rithvik.png' }
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'blogs', label: 'Blog Posts', icon: FileText },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1.15rem',
        boxSizing: 'border-box',
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* 1. LOGO & HEADER */}
      <div>
        <div style={{ padding: '0 0.4rem', marginBottom: '0.2rem' }}>
          <a
            href="/admin"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#0F172A',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}
          >
            dev<span style={{ color: '#FF5A1F' }}>.hyd</span>
          </a>
        </div>

        <div
          style={{
            paddingLeft: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94A3B8',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <ShieldCheck size={14} style={{ color: '#FF5A1F' }} /> Admin Portal
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            maxHeight: 'calc(100vh - 210px)',
            overflowY: 'auto',
            paddingRight: '2px'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <motion.button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                  background: isActive ? '#FF5A1F' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#334155',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 90, 31, 0.3)' : 'none',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#FFF4ED'
                    e.currentTarget.style.color = '#FF5A1F'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#334155'
                  }
                }}
              >
                <Icon size={18} style={{ color: isActive ? '#FFFFFF' : 'inherit' }} />
                <span>{item.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* 3. USER PROFILE & LOGOUT */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #F1F5F9'
        }}
      >
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '12px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}
        >
          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
            <img
              src={user.avatar || '/images/rithvik.png'}
              onError={(e) => {
                e.target.src = '/images/avatar-default.png'
              }}
              alt={user.name || 'Admin'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #FFFFFF'
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user.name || 'Rithvik'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
              {user.role || 'Administrator'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02, backgroundColor: '#FF5A1F', color: '#FFFFFF' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            height: '38px',
            width: '100%',
            borderRadius: '10px',
            background: '#FFFFFF',
            border: '1.5px solid #FF5A1F',
            color: '#FF5A1F',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxSizing: 'border-box',
            transition: 'all 0.15s ease'
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  )
}
