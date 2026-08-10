import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — dev.hyd',
  description: 'Terms of service and contract policies for dev.hyd web development and software deliverables.'
}

export default function TermsPage() {
  return (
    <>
      <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
        <Link href="/" className="logo">dev<span>.</span>hyd</Link>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link href="/" className="legal-back">← Back to Home</Link>
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: July 2026</p>

          <h2>1. Scope of Work</h2>
          <p>Dev.hyd delivers custom websites, web applications, WhatsApp automations, and digital solutions as outlined in agreed project proposals and milestone trackers.</p>

          <h2>2. Payment Terms</h2>
          <p>Projects typically require a 50% advance deposit upon signing, with remaining milestone installments due upon milestone verification and final domain deployment.</p>

          <h2>3. Intellectual Property</h2>
          <p>Upon final payment, full intellectual property and code ownership of the bespoke deliverables are transferred to the client.</p>

          <h2>4. Contact</h2>
          <p>Direct all inquiries to <strong>dev.hyd.official@gmail.com</strong>.</p>
        </div>
      </main>
    </>
  )
}

