import React from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <>
      <nav>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link to="/" className="legal-back">← Back to Home</Link>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: July 2026</p>

          <h2>1. Information We Collect</h2>
          <p>When you fill out our enquiry form, we collect your name, business name, WhatsApp number, email address, and the message you send. This information is used solely to respond to your enquiry.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your contact information to follow up on your web design enquiry, send project updates, and occasionally notify you of relevant services. We do not sell, rent, or share your information with third parties.</p>

          <h2>3. Data Storage</h2>
          <p>Enquiry data is stored securely on our server and is accessible only to the site owner. We retain data for up to 2 years from the date of enquiry.</p>

          <h2>4. Cookies</h2>
          <p>This site uses a single session cookie to manage login state for the client portal. No tracking or advertising cookies are used.</p>

          <h2>5. Your Rights</h2>
          <p>You may request deletion of your data at any time by contacting us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dev.hyd.official@gmail.com" target="_blank" rel="noreferrer">dev.hyd.official@gmail.com</a>.</p>

          <h2>6. Contact</h2>
          <p>For any privacy-related queries, please email <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dev.hyd.official@gmail.com" target="_blank" rel="noreferrer">dev.hyd.official@gmail.com</a> or WhatsApp us at +91 77802 52258.</p>
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
