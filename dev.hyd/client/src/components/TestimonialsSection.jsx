import React, { useState } from 'react'

const SAMPLE_REVIEWS = [
  {
    _id: '1',
    name: 'Anjali Verma',
    business: 'Luxury Salon & Spa',
    location: 'Banjara Hills, Hyderabad',
    rating: 5,
    metric: '🚀 3x Monthly Bookings',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    quote: 'Rithvik understood exactly what my business needed. The automated WhatsApp booking system he built helped our salon double our appointments within the first 2 weeks. Extremely professional and delivered right on time!'
  },
  {
    _id: '2',
    name: 'Karthik Reddy',
    business: 'Modern Bistro & Cafe',
    location: 'Jubilee Hills, Hyderabad',
    rating: 5,
    metric: '⚡ 100% Paperless QR Menu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    quote: 'The digital QR ordering menu built by dev.hyd transformed our dining experience. Customers love the instant mobile loading speed, and we saved thousands on menu reprinting costs.'
  },
  {
    _id: '3',
    name: 'Neha Kapoor',
    business: 'Ethnic Wear Boutique',
    location: 'Gachibowli, Hyderabad',
    rating: 5,
    metric: '🛍️ ₹4.5L Sales Month 1',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    quote: 'Super smooth e-commerce website with Razorpay payment gateway integration! Rithvik guided us through domain setup, product uploading, and Instagram shop integration. Highly recommended for any local retail business.'
  },
  {
    _id: '4',
    name: 'Srinivas Rao',
    business: 'TechVentures Consultancy',
    location: 'HITECH City, Hyderabad',
    rating: 5,
    metric: '📊 100% Automated Analytics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    quote: 'Outstanding software developer. He built a custom SaaS analytics dashboard that automated our daily client reports. Fast communication, clean code, and zero bugs.'
  }
]

export default function TestimonialsSection({ reviews = SAMPLE_REVIEWS }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const displayReviews = reviews.length > 0 ? reviews : SAMPLE_REVIEWS

  const nextReview = () => {
    setActiveIdx((prev) => (prev + 1) % displayReviews.length)
  }

  const prevReview = () => {
    setActiveIdx((prev) => (prev - 1 + displayReviews.length) % displayReviews.length)
  }

  const current = displayReviews[activeIdx]

  return (
    <section id="testimonials" className="testimonials-section-v2">
      <div className="testimonials-container">
        
        {/* Section Header */}
        <div className="section-head text-center">
          <span className="badge-pill">CLIENT SUCCESS STORIES</span>
          <h2>What My Clients Say</h2>
          <p className="subtitle">Trusted by local business owners and startups across Hyderabad.</p>
        </div>

        {/* Testimonials Main Card Slider */}
        <div className="testimonial-card-v2">
          
          <div className="t-card-left">
            <div className="t-avatar-wrap">
              <img src={current.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={current.name} />
              <div className="verified-badge">✓ Verified Client</div>
            </div>
            
            <div className="t-client-meta">
              <h3 className="t-client-name">{current.name}</h3>
              <span className="t-client-biz">{current.business}</span>
              <span className="t-client-loc">📍 {current.location || 'Hyderabad, IN'}</span>
            </div>
          </div>

          <div className="t-card-right">
            
            <div className="t-card-top-row">
              <div className="t-stars-row">
                {[...Array(current.rating || 5)].map((_, i) => (
                  <span key={i} className="star-icon">★</span>
                ))}
              </div>
              <div className="t-metric-chip">{current.metric || '🚀 5.0 Rated Project'}</div>
            </div>

            <blockquote className="t-quote-text">
              "{current.quote || current.text || 'Rithvik delivered a fast, high-converting website for our business. Highly recommended!'}"
            </blockquote>

            {/* Slider Navigation Buttons */}
            <div className="t-nav-row">
              <span className="t-counter-text">
                0{activeIdx + 1} / 0{displayReviews.length}
              </span>
              <div className="t-nav-btns">
                <button type="button" className="t-nav-btn" onClick={prevReview} aria-label="Previous Review">
                  ←
                </button>
                <button type="button" className="t-nav-btn" onClick={nextReview} aria-label="Next Review">
                  →
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Local Business Trust Badges Strip */}
        <div className="trust-badges-strip">
          <span className="strip-title">Empowering Local Businesses In:</span>
          <div className="location-pills">
            <span className="loc-pill">Banjara Hills</span>
            <span className="loc-pill">Jubilee Hills</span>
            <span className="loc-pill">Gachibowli</span>
            <span className="loc-pill">HITECH City</span>
            <span className="loc-pill">Madhapur</span>
            <span className="loc-pill">Kondapur</span>
          </div>
        </div>

      </div>
    </section>
  )
}
