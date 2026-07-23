# ⚡ dev.hyd — Full-Stack Web Development Portfolio & Client Portal Platform

> Modern MERN stack application built for **dev.hyd** — serving local businesses in Hyderabad (Salons, Boutiques, Restaurants, Clinics) with high-converting web apps, automated WhatsApp booking integrations, digital menus, and real-time client project tracking.

![Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20Node.js%20%7C%20Express%20%7C%20Prisma%20%7C%20PostgreSQL-orange)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

---

## 🌟 Key Features

### 🌐 Public Portfolio & Services
- **Interactive Concept Calculator**: Instant price estimations & package recommendations.
- **Dynamic Services & Testimonials**: Loaded directly from Supabase PostgreSQL database.
- **Direct Mail & WhatsApp Actions**: One-click integration sending pre-filled lead details to Gmail Web Compose or WhatsApp.
- **Public Project Tracker (`/track-project`)**: Live real-time project milestone tracking with search by Project ID or Client Email.

### 📊 Admin Portal (`/admin`)
- **Full CRUD Management**: Manage Enquiries, Clients, Projects, Blog Posts, Services, Testimonials, FAQs, and Gallery Items.
- **Integrated Client + Project Onboarding (`/admin/clients/new`)**: Single-step registration for clients with auto-generated project workspaces and balance calculations.
- **Client Emulation Mode**: Admin can emulate client portal view and switch back seamlessly with one click.
- **Financial Tracker**: Real-time total revenue, collected payments, and pending balance calculations.

### 👤 Client Portal (`/client`)
- **Interactive Project Dashboard**: Project stage timeline, milestone tracking, file downloads, and messaging.
- **Secure Password Reset & Profile Management**: Password updates with HttpOnly secure cookie authentication.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, React Router v7, React Hot Toast, TailwindCSS / CSS tokens
- **Backend**: Node.js, Express v5, Prisma ORM 6, Nodemailer, Razorpay SDK, Helmet, Compression, Express Rate Limit
- **Database**: PostgreSQL (Supabase Connection Pooling)
- **Deployment**: Vercel (Frontend SPA) + Railway (Backend API)

---

## 📁 Repository Structure

```
dev.hyd/
├── client/                     # Frontend React SPA
│   ├── public/                 # Favicon and static branding assets
│   ├── src/
│   │   ├── components/         # Reusable UI components (Sidebar, TopNav, Preloader, Calculator)
│   │   ├── context/            # AuthContext (JWT & Emulation State)
│   │   ├── pages/              # Page components (Home, Blog, Admin, Client, Tracker)
│   │   ├── services/           # Axios API Client (`publicApi`, `authApi`, `clientApi`, `adminApi`)
│   │   └── index.css           # Global design tokens and component CSS
│   ├── package.json
│   ├── vercel.json             # Vercel Deployment Configuration
│   └── vite.config.js
│
├── server/                     # Backend Express API Server
│   ├── controllers/            # Route controllers (admin, auth, client, public)
│   ├── middleware/             # Security, Auth Guard, Error Handler, Uploads
│   ├── prisma/                 # Prisma Schema & Database Migrations
│   ├── routes/                 # Express Router Endpoints
│   ├── app.js                  # Main Express Server Entrypoint
│   ├── package.json
│   └── railway.json            # Railway Deployment Configuration
│
├── .gitignore
├── deployment.md               # Step-by-Step Production Deployment Guide
└── README.md
```

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/dev.hyd.git
cd dev.hyd

# Install root, server, and client dependencies in one command
npm run install:all
```

### 2. Environment Setup
Create `dev.hyd/server/.env` file:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://postgres:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

JWT_SECRET=dev_hyd_jwt_access_secret_key_2026
JWT_REFRESH_SECRET=dev_hyd_jwt_refresh_secret_key_2026

ADMIN_EMAIL=dev.hyd.official@gmail.com
ADMIN_PASSWORD=admin123!
```

### 3. Database Migration
```bash
cd dev.hyd/server
npx prisma db push
```

### 4. Run Development Servers
```bash
# Run both Backend API (localhost:3000) and Frontend Vite (localhost:5173)
npm run dev
```

---

## 🌐 Production Deployment

Refer to the complete [Deployment Guide (deployment.md)](./deployment.md) for step-by-step instructions on deploying to **Vercel** (Frontend), **Railway** (Backend), and **Supabase** (Database).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
