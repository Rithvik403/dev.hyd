import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FolderKanban,
  Layers,
  DollarSign,
  Image as ImageIcon,
  Star,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react'

export default function AdminSidebar({
  activeTab = 'dashboard',
  onSelectTab = () => {},
  onLogout = () => {},
  user = { name: 'Rithvik', role: 'Administrator', avatar: '/images/rithvik.png' },
  isOpen = false,
  onClose = () => {}
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navGroups = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, badge: '12' },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'projects', label: 'Projects', icon: FolderKanban, badge: '7' }
      ]
    },
    {
      label: 'BUSINESS',
      items: [
        { id: 'services', label: 'Services', icon: Layers },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'testimonials', label: 'Testimonials', icon: Star },
        { id: 'blogs', label: 'Blog Posts', icon: FileText }
      ]
    },
    {
      label: 'SYSTEM & INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ]

  const sidebarWidth = isCollapsed ? '84px' : '280px'

  const renderContent = () => (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCollapsed ? '1.25rem 0.75rem' : '1.5rem 1.25rem',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxSizing: 'border-box',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
        border: '1px solid #E2E8F0',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      {/* BRAND HEADER & LOGO */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            marginBottom: '0.4rem',
            padding: isCollapsed ? '0' : '0 0.3rem'
          }}
        >
          <a
            href="/admin"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: isCollapsed ? '1.2rem' : '1.65rem',
              fontWeight: 800,
              color: '#0F172A',
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              whiteSpace: 'nowrap'
            }}
          >
            {isCollapsed ? (
              <span style={{ color: '#FF5A1F' }}>d.h</span>
            ) : (
              <>
                dev<span style={{ color: '#FF5A1F' }}>.hyd</span>
              </>
            )}
          </a>

          {/* Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#64748B',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              className="desktop-only-btn"
              title="Collapse Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              paddingLeft: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldCheck size={13} style={{ color: '#FF5A1F' }} /> Admin Suite v2.5
          </div>
        )}

        {/* NAVIGATION GROUPS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto',
            paddingRight: isCollapsed ? '0' : '2px'
          }}
        >
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    letterSpacing: '0.08em',
                    marginBottom: '0.45rem',
                    paddingLeft: '0.5rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {group.label}
                </div>
              )}

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id)
                        onClose()
                      }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      title={isCollapsed ? item.label : ''}
                      style={{
                        height: '44px',
                        padding: isCollapsed ? '0' : '0 12px',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        background: isActive
                          ? 'linear-gradient(135deg, #FF5A1F 0%, #FF3300 100%)'
                          : 'transparent',
                        color: isActive ? '#FFFFFF' : '#334155',
                        boxShadow: isActive ? '0 6px 16px rgba(255, 90, 31, 0.35)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icon
                          size={19}
                          style={{
                            color: isActive ? '#FFFFFF' : '#64748B',
                            flexShrink: 0
                          }}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#FFF4ED',
                            color: isActive ? '#FFFFFF' : '#FF5A1F'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER: PROFILE & LOGOUT */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingTop: '0.8rem',
          borderTop: '1px solid #F1F5F9'
        }}
      >
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: isCollapsed ? '6px' : '8px 10px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderRadius: '14px',
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
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #FFFFFF'
              }}
            />
          </div>

          {!isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2
                }}
              >
                {user.name || 'Rithvik'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                {user.role || 'Administrator'}
              </div>
            </div>
          )}
        </div>

        {/* Logout Action Button */}
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            height: '40px',
            width: '100%',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1.5px solid #FF5A1F',
            color: '#FF5A1F',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease'
          }}
          title="Logout"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* DESKTOP FIXED SIDEBAR */}
      <aside
        className="admin-sidebar-desktop-v3"
        style={{
          width: sidebarWidth,
          height: 'calc(100vh - 2rem)',
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          bottom: '1rem',
          zIndex: 50
        }}
      >
        {renderContent()}
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 90
              }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: '0.5rem',
                left: '0.5rem',
                bottom: '0.5rem',
                width: '280px',
                maxWidth: '88vw',
                zIndex: 100
              }}
            >
              {renderContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
