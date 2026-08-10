import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'dev.hyd — High-Converting Web Apps & SaaS Platform',
  description: 'Full-Stack Web Development, automated WhatsApp booking integrations, real-time client tracking, and digital portals for local businesses in Hyderabad.',
  keywords: ['Web Development Hyderabad', 'Digital Agency', 'SaaS', 'Client Portal', 'WhatsApp Automation']
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syne:wght@600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

