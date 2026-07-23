import React, { useState } from 'react'

const PORTFOLIO_CATEGORIES = ['All', 'Web Apps', 'E-Commerce', 'Business Sites', 'Dashboards']

const SAMPLE_PROJECTS = [
  {
    _id: '1',
    title: 'Luxury Salon & Spa Booking System',
    category: 'Web Apps',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Node.js', 'WhatsApp API', 'MongoDB'],
    metric: '🚀 3x Booking Increase',
    demoUrl: 'https://example.com/demo1',
    description: 'Custom online appointment scheduling system with automated WhatsApp confirmation messages for clients.',
    client: 'Anjali Verma (Luxury Salon)',
    impact: 'Automated 150+ monthly appointment bookings and eliminated phone call scheduling delays.'
  },
  {
    _id: '2',
    title: 'Fashion & Ethnic Wear E-Commerce',
    category: 'E-Commerce',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Razorpay', 'Tailwind', 'Express'],
    metric: '🛍️ ₹4.5L Sales Month 1',
    demoUrl: 'https://example.com/demo2',
    description: 'High-converting boutique e-commerce web app with instant Razorpay checkout, product filters & inventory management.',
    client: 'Neha Kapoor (Boutique Owner)',
    impact: 'Launched online sales within 10 days, enabling delivery across India.'
  },
  {
    _id: '3',
    title: 'Modern Bistro Digital Menu & Ordering',
    category: 'Business Sites',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'QR Code', 'Location API', 'Mobile-First'],
    metric: '⚡ 100% Mobile Optimized',
    demoUrl: 'https://example.com/demo3',
    description: 'Mobile-first QR code digital menu & location finder for a popular cafe in Jubilee Hills, Hyderabad.',
    client: 'Karthik Reddy (Modern Bistro)',
    impact: 'Reduced menu printing costs to zero and improved customer table turn time by 20%.'
  },
  {
    _id: '4',
    title: 'SaaS Client Analytics Dashboard',
    category: 'Dashboards',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tags: ['React', 'Recharts', 'REST API', 'Auth'],
    metric: '📊 Real-time Insights',
    demoUrl: 'https://example.com/demo4',
    description: 'Custom administrative dashboard monitoring monthly revenue, user growth & automated report generation.',
    client: 'TechVentures Hyderabad',
    impact: 'Replaced manual Excel spreadsheets with automated live analytics for executive team.'
  }
]

export default function PortfolioSection({ items = SAMPLE_PROJECTS }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)

  const displayItems = items.length > 0 ? items : SAMPLE_PROJECTS

  const filteredItems = activeCategory === 'All'
    ? displayItems
    : displayItems.filter(item => {
        if (!item.category) return true
        return item.category.toLowerCase().includes(activeCategory.toLowerCase().replace(' ', '')) ||
               activeCategory.toLowerCase().includes(item.category.toLowerCase().replace(' ', ''))
      })

  return (
    <section id="work" className="portfolio-section-new">
      <div className="portfolio-container">
        
        {/* Section Header */}
        <div className="section-head text-center">
          <span className="badge-pill">SELECTED WORK</span>
          <h2>Featured Case Studies</h2>
          <p className="subtitle">Real web applications and digital experiences built for businesses in Hyderabad.</p>
        </div>

        {/* Category Filter Pills */}
        <div className="portfolio-filter-bar">
          {PORTFOLIO_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="portfolio-grid-v2">
          {filteredItems.map(project => (
            <div key={project._id || project.title} className="project-card-v2">
              
              {/* Image Container with Metric Badge */}
              <div className="project-img-wrap">
                <img src={project.image} alt={project.title} className="project-img" />
                <div className="project-metric-badge">{project.metric || '🚀 Production Ready'}</div>
              </div>

              {/* Card Body */}
              <div className="project-card-content">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.description}</p>
                
                {/* Tech Stack Tags */}
                <div className="project-tags-row">
                  {(project.tags || []).map(tag => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="project-card-actions">
                  <button
                    type="button"
                    className="case-study-btn"
                    onClick={() => setSelectedProject(project)}
                  >
                    View Case Study →
                  </button>
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="live-demo-link"
                    >
                      Live Demo ↗
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Case Study Modal Popup */}
      {selectedProject && (
        <div className="project-modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="project-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedProject(null)}
            >
              ×
            </button>

            <div className="modal-img-wrap">
              <img src={selectedProject.image} alt={selectedProject.title} />
              <div className="modal-metric-pill">{selectedProject.metric}</div>
            </div>

            <div className="modal-body">
              <h3>{selectedProject.title}</h3>
              <p className="modal-desc">{selectedProject.description}</p>

              {selectedProject.impact && (
                <div className="modal-impact-box">
                  <strong>Impact & Results:</strong>
                  <p>{selectedProject.impact}</p>
                </div>
              )}

              {selectedProject.client && (
                <div className="modal-client-quote">
                  <span>Client Feedback:</span>
                  <blockquote>"{selectedProject.client}"</blockquote>
                </div>
              )}

              <div className="modal-actions">
                <a
                  href={`https://wa.me/917780252258?text=${encodeURIComponent(`Hi dev.hyd! I saw your portfolio case study for "${selectedProject.title}" and would like a similar project built for my business.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-wa-btn"
                >
                  Request Similar Project on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
