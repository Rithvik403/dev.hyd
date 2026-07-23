import React from 'react'
import { Link } from 'react-router-dom'

export default function RefundPolicy() {
  return (
    <>
      <nav>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link to="/" className="legal-back">← Back to Home</Link>
          <h1>Refund Policy</h1>
          <p className="legal-updated">Last updated: July 2026</p>

          <h2>1. Advance Payment</h2>
          <p>The 50% advance payment paid before project commencement is non-refundable once work has begun. This covers the initial design and planning work.</p>

          <h2>2. Final Payment</h2>
          <p>The remaining 50% balance payment is due upon project completion and delivery. This payment is non-refundable once the final files/website have been handed over.</p>

          <h2>3. Eligible Refunds</h2>
          <p>A full refund of the advance payment will be issued if:</p>
          <ul>
            <li>We are unable to commence work within the agreed timeline due to our own fault.</li>
            <li>The project is cancelled by us before any work has been started.</li>
          </ul>

          <h2>4. Revision Policy</h2>
          <p>We do not offer refunds for dissatisfaction once revisions are exhausted. We encourage all clients to review designs carefully at each stage and raise concerns promptly.</p>

          <h2>5. How to Request a Refund</h2>
          <p>To raise a refund request, contact us via WhatsApp at +91 77802 52258 or email <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dev.hyd.official@gmail.com" target="_blank" rel="noreferrer">dev.hyd.official@gmail.com</a>. Eligible refunds are processed within 7–10 business days.</p>
        </div>
      </main>

      <footer className="footer-new" style={{ marginTop: 0 }}>
        <div className="footer-bottom-new">
          <div className="footer-bottom-left">© 2026 dev.hyd — Gowlidoddi, Hyderabad</div>
          <div className="footer-bottom-right">
            <Link to="/legal/privacy">Privacy Policy</Link> &nbsp;·&nbsp;
            <Link to="/legal/terms">Terms</Link> &nbsp;·&nbsp;
            <Link to="/legal/refund">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
