import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy — dev.hyd',
  description: 'Milestone refund and satisfaction terms for dev.hyd web services.'
}

export default function RefundPolicyPage() {
  return (
    <>
      <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
        <Link href="/" className="logo">dev<span>.</span>hyd</Link>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link href="/" className="legal-back">← Back to Home</Link>
          <h1>Refund Policy</h1>
          <p className="legal-updated">Last updated: July 2026</p>

          <h2>1. Discovery Phase Guarantee</h2>
          <p>If you are not satisfied with initial design prototypes during the Discovery & Wireframing phase, we offer a 100% full refund on deposit before development sprint starts.</p>

          <h2>2. Active Development Milestones</h2>
          <p>Once milestones are approved in the Client Portal Tracker, payments applied to completed work are non-refundable as dedicated engineering hours have been delivered.</p>

          <h2>3. Support & Revisions</h2>
          <p>All delivered websites include 30 days of complimentary post-launch support and bug fixes.</p>
        </div>
      </main>
    </>
  )
}

