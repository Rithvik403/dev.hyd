import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'

export default function BlogForm() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)
  const [coverFile, setCoverFile] = useState(null)
  const [coverUrl, setCoverUrl] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('slug', slug)
    formData.append('excerpt', excerpt)
    formData.append('content', content)
    formData.append('published', published)
    if (coverFile) {
      formData.append('cover', coverFile)
    } else {
      formData.append('cover', coverUrl || '/images/blog-default.png')
    }

    toast.loading('Publishing blog post...')
    try {
      await adminApi.createBlogPost(formData)
      toast.dismiss()
      toast.success('✍️ Blog post created successfully!')
      navigate('/admin')
    } catch (err) {
      toast.dismiss()
      const msg = err.response?.data?.error || err.message || 'Failed to create blog post'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
        <nav className="sidebar-nav">
          <Link to="/admin">📊 Dashboard</Link>
          <Link to="/admin/clients/new">➕ New Client</Link>
          <Link to="/admin/projects/new">🚀 New Project</Link>
          <Link to="/admin/blog/new" className="active">✍️ New Post</Link>
          <Link to="/" target="_blank">🌐 View Site</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="form-page-header">
          <div className="form-page-badge">✍️ CONTENT MANAGEMENT</div>
          <h1>Write New Blog Post</h1>
          <p className="form-page-subtitle">Publish technical articles, case studies, and web design tips for your audience.</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form-container">
          {error && (
            <div className="form-error-banner">
              ⚠️ {error}
            </div>
          )}

          <div className="form-card-section">
            <div className="section-header">
              <span className="section-icon">📄</span>
              <div>
                <h3>Post Details</h3>
                <p>Title, URL permalink slug, and cover media.</p>
              </div>
            </div>

            <div className="form-field">
              <label>Article Title *</label>
              <div className="input-with-icon">
                <span className="input-icon">📝</span>
                <input 
                  type="text" 
                  placeholder="e.g. Why Every Salon Needs a Modern Website in 2026" 
                  value={title} 
                  onChange={handleTitleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-field">
              <label>Permalink Slug * (URL identifier)</label>
              <div className="input-with-icon">
                <span className="input-icon">🔗</span>
                <input 
                  type="text" 
                  placeholder="why-every-salon-needs-modern-website" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  required 
                />
              </div>
              <small className="field-hint">Preview URL: <code>devhyd.com/blog/{slug || 'your-slug-here'}</code></small>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Upload Cover Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setCoverFile(e.target.files[0])} 
                  style={{ border: 'none', background: 'none', padding: 0 }}
                />
              </div>
              <div className="form-field">
                <label>Or Cover Image URL</label>
                <input 
                  type="text" 
                  placeholder="e.g. /images/blog-post-1.png"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-field">
              <label>Excerpt / Summary (Shown on Blog Cards)</label>
              <textarea 
                rows="2" 
                placeholder="A concise 1-2 sentence teaser summarizing the key take-aways of this article..."
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-card-section">
            <div className="section-header">
              <span className="section-icon">✍️</span>
              <div>
                <h3>Markdown Article Content</h3>
                <p>Write your article using Markdown headers, lists, code blocks, and bold text.</p>
              </div>
            </div>

            <div className="form-field">
              <label>Body Content *</label>
              <textarea 
                rows="14" 
                placeholder="## Introduction&#10;&#10;In today's digital landscape...&#10;&#10;### Key Benefits:&#10;- Instant Online Booking&#10;- 24/7 Availability&#10;- Higher Conversions"
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required
                style={{ fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: '1.5' }}
              />
            </div>

            <div className="form-field" style={{ marginTop: '1rem' }}>
              <label className="toggle-switch-container" style={{ background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <input 
                  type="checkbox" 
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-label-content">
                  <strong>Publish Immediately</strong>
                  <span>Make this article publicly accessible on the blog right now.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-actions-bar">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Publishing...' : '✨ Publish Blog Post'}
            </button>
            <Link to="/admin" className="btn btn-outline btn-lg">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  )
}
