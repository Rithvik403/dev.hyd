import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — dev.hyd',
  description: 'Privacy policy and data collection transparency for dev.hyd clients and visitors.'
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
        <Link href="/" className="logo">dev<span>.</span>hyd</Link>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link href="/" className="legal-back">← Back to Home</Link>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: July 2026</p>

          <h2>1. Information We Collect</h2>
          <p>When you fill out our enquiry form, we collect your name, business name, WhatsApp number, email address, and the message you send. This information is used solely to respond to your enquiry.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your contact details to communicate regarding web development projects, send project updates, invoice deliverables, and coordinate WhatsApp integrations. We never sell or share your data with third parties.</p>

          <h2>3. Cookies & Local Storage</h2>
          <p>We use essential cookies and browser session tokens strictly to keep you authenticated inside your client workspace and admin dashboard.</p>

          <h2>4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, contact us at <strong>dev.hyd.official@gmail.com</strong>.</p>
        </div>
      </main>
    </>
  )
}

