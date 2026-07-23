import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Post() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [headings, setHeadings] = useState([])
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const { role } = useAuth()

  useEffect(() => {
    publicApi.getBlogPost(slug)
      .then(res => {
        const blogPost = res.data.post
        setPost(blogPost)
        
        // Dynamic outline generation: Parse HTML headers and assign IDs for scroll anchors
        const parser = new DOMParser()
        const doc = parser.parseFromString(res.data.htmlContent, 'text/html')
        const hElements = doc.querySelectorAll('h2, h3')
        const extractedHeadings = []
        
        hElements.forEach((el, idx) => {
          const text = el.innerText
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + idx
          el.setAttribute('id', id)
          extractedHeadings.push({
            text,
            id,
            level: el.tagName.toLowerCase()
          })
        })
        
        setHtmlContent(doc.body.innerHTML)
        setHeadings(extractedHeadings)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }, [slug])

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleDemoSubmit = (e) => {
    e.preventDefault()
    const msg = encodeURIComponent(`Hi Rithvik, I read your blog post "${post?.title}" and I'd like to get a free website concept demo. My contact email is: ${email}`)
    window.open(`https://wa.me/917780252258?text=${msg}`, '_blank')
    setSubmitted(true)
    setEmail('')
  }

  const readTime = post
    ? Math.max(1, Math.ceil((post.content?.split(' ').length || 200) / 200))
    : 0

  if (loading) {
    return (
      <div className="post-loading-screen">
        <div className="post-loading-spinner" />
        <span>Loading article…</span>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="post-error-screen">
        <h2>Article Not Found</h2>
        <p>{error || 'The requested article could not be loaded.'}</p>
        <Link to="/blog" className="btn btn-primary">← Back to Blog</Link>
      </div>
    )
  }

  const dateLabel = formatDate(post.created_at || post.createdAt)

  return (
    <>
      <nav className={navOpen ? 'nav-open' : ''}>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
        <button type="button" id="navToggle" aria-label="Toggle Navigation" onClick={() => setNavOpen(true)}>
          <span></span><span></span><span></span>
        </button>
        <div className="nav-links">
          <button type="button" id="navClose" aria-label="Close Navigation" onClick={() => setNavOpen(false)}>×</button>
          <Link to="/" onClick={() => setNavOpen(false)}>Home</Link>
          <a href="/#latest-blog" onClick={() => setNavOpen(false)}>Blog</a>
          <a href="/#contact" onClick={() => setNavOpen(false)}>Contact</a>
          {role === 'admin' ? (
            <Link to="/admin" className="nav-accent-link" onClick={() => setNavOpen(false)}>Admin Dashboard</Link>
          ) : role === 'client' ? (
            <Link to="/client" className="nav-accent-link" onClick={() => setNavOpen(false)}>My Project</Link>
          ) : null}
        </div>
      </nav>

      <main className="post-page">
        <div className="post-container-grid">
          
          {/* ── Left Column: Article Content ── */}
          <article className="post-main-content">
            
            <Link to="/blog" className="post-back-link">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4l-6 6 6 6" />
              </svg>
              Back to blog
            </Link>

            <h1 className="post-title">{post.title}</h1>

            <div className="post-meta-row">
              {dateLabel && <><span className="post-meta-date">{dateLabel}</span><span className="post-meta-dot">·</span></>}
              <span className="post-meta-author">by {post.author || 'Rithvik'}</span>
              <span className="post-meta-dot">·</span>
              <span className="post-meta-readtime">{readTime} min read</span>
            </div>

            {post.excerpt && (
              <p className="post-excerpt">{post.excerpt}</p>
            )}

            {post.cover && (
              <div className="post-cover-wrap">
                <img src={post.cover} alt={post.title} className="post-cover-img" />
              </div>
            )}

            <div className="post-body" dangerouslySetInnerHTML={{ __html: htmlContent }} />

          </article>

          {/* ── Right Column: Sticky Sidebar ── */}
          <aside className="post-sidebar">
            
            {/* Outline Widget (TOC) */}
            {headings.length > 0 && (
              <div className="sidebar-widget outline-widget">
                <span className="widget-label">In this article</span>
                <ul className="outline-list">
                  {headings.map((h, i) => (
                    <li key={i} className={`outline-item outline-${h.level}`}>
                      <a href={`#${h.id}`}>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author Widget */}
            <div className="sidebar-widget author-widget">
              <span className="widget-label">Written by</span>
              <div className="author-info">
                <div className="author-avatar">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="author-details">
                  <strong>{post.author || 'Rithvik'}</strong>
                  <span>Founder & Developer</span>
                </div>
              </div>
            </div>

            {/* Demo CTA Widget */}
            <div className="sidebar-widget cta-widget">
              <span className="widget-label">Free Concept Demo</span>
              <h3>Want to see your business online?</h3>
              <p>I build 100% free homepage concept drafts for Hyderabad businesses in 2 days. Pay only if you love it.</p>
              
              {submitted ? (
                <div className="cta-submitted-box">
                  <span className="checkmark-icon">✓</span>
                  <span>Enquiry sent to WhatsApp!</span>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="sidebar-cta-form">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="sidebar-input"
                  />
                  <button type="submit" className="btn btn-primary btn-block">
                    Get Free Demo →
                  </button>
                </form>
              )}
            </div>

          </aside>

        </div>
      </main>

      <footer className="post-footer">
        <span>© 2026 dev.hyd</span>
        <Link to="/">Home</Link>
      </footer>
    </>
  )
}
