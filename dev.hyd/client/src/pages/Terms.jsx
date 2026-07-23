import React from 'react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <>
      <nav>
        <Link to="/" className="logo">dev<span>.</span>hyd</Link>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link to="/" className="legal-back">← Back to Home</Link>
          <h1>Terms &amp; Conditions</h1>
          <p className="legal-updated">Last updated: July 2026</p>

          <h2>1. Services</h2>
          <p>Dev.hyd ("we", "us", "the developer") provides web design, development, and branding services to businesses in Hyderabad, India. All services are subject to the scope agreed upon in writing (via WhatsApp or email) before work begins.</p>

          <h2>2. Payment</h2>
          <p>A 50% advance payment is required before work begins. The remaining balance is due upon final delivery of the project. Payment can be made via UPI or bank transfer.</p>

          <h2>3. Revisions</h2>
          <p>Each package includes 2–3 rounds of revisions as communicated at the start of the project. Additional revisions may incur extra charges.</p>

          <h2>4. Client Responsibilities</h2>
          <p>The client is responsible for providing all required content (text, images, logos) in a timely manner. Delays in content delivery may extend the project timeline.</p>

          <h2>5. Intellectual Property</h2>
          <p>Upon full payment, the client receives full ownership of the final website design and code. We retain the right to display the project in our portfolio unless otherwise agreed.</p>

          <h2>6. Limitation of Liability</h2>
          <p>We are not liable for any indirect or consequential losses arising from the use of the website. Our maximum liability is limited to the amount paid for the project.</p>

          <h2>7. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Hyderabad, Telangana.</p>

          <h2>8. Contact</h2>
          <p>For any questions about these terms, contact us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dev.hyd.official@gmail.com" target="_blank" rel="noreferrer">dev.hyd.official@gmail.com</a>.</p>
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
