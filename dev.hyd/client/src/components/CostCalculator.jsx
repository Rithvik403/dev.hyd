import React, { useState } from 'react'

const PROJECT_TYPES = [
  { id: 'website', name: 'Business Website', basePrice: 15000, desc: 'Clean site with SEO optimization, location & WhatsApp booking' },
  { id: 'webapp', name: 'Custom Web Application', basePrice: 35000, desc: 'Interactive web software with database & logic' },
  { id: 'ecommerce', name: 'E-Commerce Store', basePrice: 28000, desc: 'Online store with products, cart & checkout' },
  { id: 'mobile', name: 'Mobile App (iOS/Android)', basePrice: 45000, desc: 'Cross-platform app for mobile devices' },
  { id: 'speed', name: 'Speed & SEO Optimization', basePrice: 10000, desc: 'Performance tuning, Core Web Vitals & SEO' }
]

const SCOPE_OPTIONS = [
  { id: 'landing', name: '1 Page (Landing Page)', price: 0 },
  { id: 'small', name: '3 - 5 Pages', price: 5000 },
  { id: 'medium', name: '6 - 12 Pages', price: 12000 },
  { id: 'large', name: 'Complex / Enterprise', price: 25000 }
]

const FEATURE_ADDONS = [
  { id: 'auth', name: 'User Login & Profiles', price: 5000 },
  { id: 'payments', name: 'Payment Gateway (Razorpay/Stripe)', price: 6000 },
  { id: 'admin', name: 'Custom Admin Dashboard', price: 10000 },
  { id: 'whatsapp', name: 'WhatsApp Direct Booking', price: 4000 },
  { id: 'seo', name: 'Advanced SEO & Analytics', price: 5000 },
  { id: 'api', name: 'Custom Database & API', price: 8000 }
]

const TIMELINE_OPTIONS = [
  { id: 'standard', name: 'Standard (2-3 Weeks)', multiplier: 1.0 },
  { id: 'express', name: 'Express Rush (1 Week)', multiplier: 1.25 }
]

export default function CostCalculator() {
  const [selectedType, setSelectedType] = useState('webapp')
  const [selectedScope, setSelectedScope] = useState('small')
  const [selectedFeatures, setSelectedFeatures] = useState(['auth', 'payments'])
  const [selectedTimeline, setSelectedTimeline] = useState('standard')

  // Calculate prices
  const typeObj = PROJECT_TYPES.find(t => t.id === selectedType) || PROJECT_TYPES[0]
  const scopeObj = SCOPE_OPTIONS.find(s => s.id === selectedScope) || SCOPE_OPTIONS[0]
  const timelineObj = TIMELINE_OPTIONS.find(t => t.id === selectedTimeline) || TIMELINE_OPTIONS[0]

  const featureTotal = selectedFeatures.reduce((acc, featId) => {
    const feat = FEATURE_ADDONS.find(f => f.id === featId)
    return acc + (feat ? feat.price : 0)
  }, 0)

  const subtotal = (typeObj.basePrice + scopeObj.price + featureTotal) * timelineObj.multiplier
  const minPrice = Math.round(subtotal)
  const maxPrice = Math.round(subtotal * 1.15) // +15% upper range

  const toggleFeature = (id) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id))
    } else {
      setSelectedFeatures([...selectedFeatures, id])
    }
  }

  // Format currency
  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  // Construct WhatsApp booking message
  const featureNames = selectedFeatures
    .map(id => FEATURE_ADDONS.find(f => f.id === id)?.name)
    .filter(Boolean)
    .join(', ')

  const waMessage = `Hi dev.hyd! I calculated an estimate on your website:
- *Project*: ${typeObj.name}
- *Scope*: ${scopeObj.name}
- *Features*: ${featureNames || 'None'}
- *Timeline*: ${timelineObj.name}
- *Estimated Budget*: ${formatINR(minPrice)} - ${formatINR(maxPrice)}

Can we discuss starting this project?`

  const waUrl = `https://wa.me/917780252258?text=${encodeURIComponent(waMessage)}`

  return (
    <section className="cost-calculator-section" id="pricing">
      <div className="calc-container">
        
        {/* Section Header */}
        <div className="section-head text-center">
          <span className="badge-pill">Project Cost Calculator</span>
          <h2>Instant Transparent Pricing</h2>
          <p className="subtitle">Select your requirements below to get a real-time estimate for your project in Hyderabad.</p>
        </div>

        <div className="calc-grid">
          
          {/* Main Controls Panel */}
          <div className="calc-controls">
            
            {/* 1. Project Type */}
            <div className="calc-group">
              <h3 className="calc-group-title">1. What type of project do you need?</h3>
              <div className="type-cards-grid">
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className={`type-card ${selectedType === type.id ? 'active' : ''}`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="type-card-head">
                      <span className="type-name">{type.name}</span>
                      <span className="type-price">From {formatINR(type.basePrice)}</span>
                    </div>
                    <p className="type-desc">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Scope / Pages */}
            <div className="calc-group">
              <h3 className="calc-group-title">2. Select Project Scope & Size</h3>
              <div className="pill-options-grid">
                {SCOPE_OPTIONS.map(scope => (
                  <button
                    key={scope.id}
                    type="button"
                    className={`pill-option ${selectedScope === scope.id ? 'active' : ''}`}
                    onClick={() => setSelectedScope(scope.id)}
                  >
                    <span>{scope.name}</span>
                    <span className="pill-price">{scope.price > 0 ? `+${formatINR(scope.price)}` : 'Included'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Features & Addons */}
            <div className="calc-group">
              <h3 className="calc-group-title">3. Add Extra Features & Functionality</h3>
              <div className="checkbox-features-grid">
                {FEATURE_ADDONS.map(feat => {
                  const isChecked = selectedFeatures.includes(feat.id)
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      className={`feature-checkbox-card ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleFeature(feat.id)}
                    >
                      <div className={`checkbox-box ${isChecked ? 'checked' : ''}`}>
                        {isChecked && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="feature-info">
                        <span className="feat-name">{feat.name}</span>
                        <span className="feat-price">+{formatINR(feat.price)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4. Timeline */}
            <div className="calc-group">
              <h3 className="calc-group-title">4. Delivery Timeline</h3>
              <div className="pill-options-grid">
                {TIMELINE_OPTIONS.map(tl => (
                  <button
                    key={tl.id}
                    type="button"
                    className={`pill-option ${selectedTimeline === tl.id ? 'active' : ''}`}
                    onClick={() => setSelectedTimeline(tl.id)}
                  >
                    <span>{tl.name}</span>
                    <span className="pill-price">{tl.multiplier > 1.0 ? '+25% Rush' : 'Standard'}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Estimate Summary Box */}
          <div className="calc-summary-sidebar">
            <div className="summary-sticky-card">
              <div className="summary-badge">ESTIMATED INVESTMENT</div>
              
              <div className="price-display">
                <span className="price-range">
                  {formatINR(minPrice)} – {formatINR(maxPrice)}
                </span>
                <span className="price-note">*Estimated range based on selections</span>
              </div>

              <div className="summary-breakdown-list">
                <div className="summary-item">
                  <span className="item-label">Type:</span>
                  <span className="item-value">{typeObj.name}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Scope:</span>
                  <span className="item-value">{scopeObj.name}</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Features:</span>
                  <span className="item-value">{selectedFeatures.length} selected</span>
                </div>
                <div className="summary-item">
                  <span className="item-label">Timeline:</span>
                  <span className="item-value">{timelineObj.name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="summary-actions">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calc-wa-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-0.981z" />
                  </svg>
                  <span>Discuss Estimate on WhatsApp</span>
                </a>
              </div>

              <div className="trust-notes">
                <span>⚡ No hidden fees</span>
                <span>•</span>
                <span>🔒 100% Satisfaction Guarantee</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
