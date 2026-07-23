import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, role } = useAuth()

  useEffect(() => {
    publicApi.getBlogs()
      .then(res => {
        setPosts(res.data || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      })
  }, [])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <>
      <nav>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="/#latest-blog" className="active">Blog</a>
          <a href="/#contact">Contact</a>
          {role === 'admin' ? (
            <Link to="/admin" style={{ color: 'var(--accent)', fontWeight: 600 }}>Admin Dashboard</Link>
          ) : role === 'client' ? (
            <Link to="/client" style={{ color: 'var(--accent)', fontWeight: 600 }}>My Project</Link>
          ) : (
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Client Login</Link>
          )}
        </div>
      </nav>

      <section className="page-hero">
        <div className="section-tag-small">BLOG</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
          Tips & guides for local businesses.
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: '50ch' }}>
          How to grow your business online — for salons, boutiques, clinics and shops in Hyderabad.
        </p>
      </section>

      <section style={{ paddingTop: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Loading posts...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--error)' }}>Error: {error}</div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <div className="blog-card" key={post._id}>
                {post.cover && (
                  <div style={{ height: '140px', overflow: 'hidden', borderRadius: '6px', marginBottom: '1rem' }}>
                    <img src={post.cover} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="blog-date">{formatDate(post.created_at)}</div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`}>Read more →</Link>
              </div>
            ))}
            {posts.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>No posts yet. Check back soon!</p>
            )}
          </div>
        )}
      </section>

      <footer>
        <div style={{ padding: '0 8%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.85rem' }}>
          <span>© 2026 dev.hyd</span>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        </div>
      </footer>
    </>
  )
}
