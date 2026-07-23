import React from 'react'

const MATRIX_FEATURES = [
  { name: 'Custom Mobile-Responsive Design', website: true, webapp: true, ecommerce: true },
  { name: 'Google SEO & Core Web Vitals Optimization', website: true, webapp: true, ecommerce: true },
  { name: 'WhatsApp Direct Lead Booking Button', website: true, webapp: true, ecommerce: true },
  { name: 'High-Speed Hosting & SSL Setup', website: true, webapp: true, ecommerce: true },
  { name: 'User Authentication & Client Accounts', website: false, webapp: true, ecommerce: true },
  { name: 'Database Storage & Custom REST APIs', website: false, webapp: true, ecommerce: true },
  { name: 'Product Catalog, Inventory & Cart', website: false, webapp: 'If Required', ecommerce: true },
  { name: 'Dedicated Client Portal & Google Meet Support', website: false, webapp: true, ecommerce: true },
  { name: 'Free Support & Maintenance', website: '1 Month', webapp: '3 Months', ecommerce: '1.5 Months' }
]

export default function ServicesMatrix() {
  const scrollToPricing = () => {
    const calc = document.getElementById('pricing')
    if (calc) {
      calc.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="services-matrix-section">
      <div className="matrix-container">
        
        {/* Section Header */}
        <div className="section-head text-center">
          <span className="badge-pill">TIER COMPARISON</span>
          <h2>Compare Package Features</h2>
          <p className="subtitle">Detailed breakdown of included features, integrations & support across all development packages.</p>
        </div>

        {/* Matrix Table */}
        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="feature-col">Included Features</th>
                <th className="tier-col">
                  <span className="tier-badge">POPULAR</span>
                  <div className="tier-name">Business Website</div>
                  <div className="tier-price">From ₹15,000</div>
                  <button type="button" onClick={scrollToPricing} className="matrix-cta-btn">
                    Calculate Price →
                  </button>
                </th>
                <th className="tier-col featured-tier">
                  <span className="tier-badge accent">BEST VALUE</span>
                  <div className="tier-name">Custom Web App</div>
                  <div className="tier-price">From ₹35,000</div>
                  <button type="button" onClick={scrollToPricing} className="matrix-cta-btn primary">
                    Calculate Price →
                  </button>
                </th>
                <th className="tier-col">
                  <span className="tier-badge">E-COMMERCE</span>
                  <div className="tier-name">Online Store</div>
                  <div className="tier-price">From ₹28,000</div>
                  <button type="button" onClick={scrollToPricing} className="matrix-cta-btn">
                    Calculate Price →
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_FEATURES.map((feat, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'even-row' : ''}>
                  <td className="feat-title">{feat.name}</td>
                  
                  {/* Website Column */}
                  <td className="tier-val">
                    {typeof feat.website === 'boolean' ? (
                      feat.website ? <span className="check-icon">✓</span> : <span className="cross-icon">—</span>
                    ) : (
                      <span className="text-val">{feat.website}</span>
                    )}
                  </td>

                  {/* Web App Column */}
                  <td className="tier-val featured-col">
                    {typeof feat.webapp === 'boolean' ? (
                      feat.webapp ? <span className="check-icon">✓</span> : <span className="cross-icon">—</span>
                    ) : (
                      <span className="text-val">{feat.webapp}</span>
                    )}
                  </td>

                  {/* E-Commerce Column */}
                  <td className="tier-val">
                    {typeof feat.ecommerce === 'boolean' ? (
                      feat.ecommerce ? <span className="check-icon">✓</span> : <span className="cross-icon">—</span>
                    ) : (
                      <span className="text-val">{feat.ecommerce}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  )
}
