import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function QuickLeadWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Business Website')
  const [preferredContact, setPreferredContact] = useState('whatsapp')
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [widgetErrors, setWidgetErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    const errs = {}
    if (!businessName.trim()) errs.businessName = 'Please enter your business or brand name'
    if (!phoneOrEmail.trim()) errs.phoneOrEmail = 'Please enter your phone or WhatsApp number'

    if (Object.keys(errs).length > 0) {
      setWidgetErrors(errs)
      return
    }

    setWidgetErrors({})
    setIsSubmitting(true)

    const msg = `Hi dev.hyd! I want to schedule a free project consultation:
- *Business*: ${businessName || 'Local Business'}
- *Looking For*: ${businessType}
- *Contact*: ${phoneOrEmail || 'N/A'}
- *Preferred Channel*: ${preferredContact.toUpperCase()}`

    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Consultation request sent! Opening WhatsApp...')
      setIsOpen(false)
      window.open(`https://wa.me/917780252258?text=${encodeURIComponent(msg)}`, '_blank')
    }, 600)
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        type="button"
        className="quick-lead-float-btn"
        onClick={() => setIsOpen(true)}
        title="Get Instant Project Quote"
      >
        <span className="float-pulse"></span>
        <span className="float-icon">⚡</span>
        <span className="float-text">Free Consultation & Demo</span>
      </button>

      {/* Quick Lead Modal */}
      {isOpen && (
        <div className="quick-lead-backdrop" onClick={() => setIsOpen(null)}>
          <div className="quick-lead-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

            <div className="quick-lead-head text-center">
              <span className="badge-pill">FREE 15-MIN STRATEGY CALL</span>
              <h2>Let's Build Your Website</h2>
              <p className="subtitle">Get a free live demo concept & custom project quote within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="quick-lead-form" noValidate>
              <div>
                <label className="quick-lbl">Your Business / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad Bistro / Luxury Salon"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value)
                    if (widgetErrors.businessName) setWidgetErrors(prev => ({ ...prev, businessName: null }))
                  }}
                  className={`quick-input ${widgetErrors.businessName ? 'input-error' : ''}`}
                />
                {widgetErrors.businessName && (
                  <span className="field-error-hint">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {widgetErrors.businessName}
                  </span>
                )}
              </div>

              <div>
                <label className="quick-lbl">What are you looking to build?</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="quick-input"
                >
                  <option>Business Website (₹15,000)</option>
                  <option>Custom Web Application (₹35,000)</option>
                  <option>E-Commerce Store (₹28,000)</option>
                  <option>Mobile App (iOS/Android)</option>
                  <option>Speed & Google SEO Fix</option>
                </select>
              </div>

              <div>
                <label className="quick-lbl">Phone Number / WhatsApp</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneOrEmail}
                  onChange={(e) => {
                    setPhoneOrEmail(e.target.value)
                    if (widgetErrors.phoneOrEmail) setWidgetErrors(prev => ({ ...prev, phoneOrEmail: null }))
                  }}
                  className={`quick-input ${widgetErrors.phoneOrEmail ? 'input-error' : ''}`}
                />
                {widgetErrors.phoneOrEmail && (
                  <span className="field-error-hint">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {widgetErrors.phoneOrEmail}
                  </span>
                )}
              </div>

              <div>
                <label className="quick-lbl">Preferred Discussion Channel</label>
                <div className="contact-methods-row">
                  <button
                    type="button"
                    className={`method-chip ${preferredContact === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => setPreferredContact('whatsapp')}
                  >
                    💬 WhatsApp Chat
                  </button>
                  <button
                    type="button"
                    className={`method-chip ${preferredContact === 'meet' ? 'active' : ''}`}
                    onClick={() => setPreferredContact('meet')}
                  >
                    🎥 Google Meet Call
                  </button>
                  <button
                    type="button"
                    className={`method-chip ${preferredContact === 'phone' ? 'active' : ''}`}
                    onClick={() => setPreferredContact('phone')}
                  >
                    📞 Phone Call
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="quick-submit-btn"
              >
                {isSubmitting ? 'Sending Request...' : 'Get Free Quote & Demo →'}
              </button>

              <div className="quick-trust-note text-center">
                🔒 100% Free Consultation • Zero Obligation
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
