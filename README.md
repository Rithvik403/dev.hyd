# 🚀 dev.hyd — Production SaaS & Digital Agency Platform

**dev.hyd** is a modern, high-performance SaaS Agency Platform engineered with a **React + Tailwind CSS** frontend, **Node.js + Express** modular backend, **Supabase PostgreSQL** database with Prisma ORM, and an **Event-Driven n8n Automation Engine**.

---

## 🏗️ Enterprise Architecture & Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons, React Router v6, Axios, Hot Toast.
- **Backend**: Node.js, Express.js (Modular Controllers, Services, Event Emitter, Middleware).
- **Database**: PostgreSQL hosted on Supabase managed via Prisma ORM.
- **Event Engine**: Internal `SystemEventEmitter` emitting 15+ typed lifecycle events (`CONTACT_CREATED`, `CLIENT_CREATED`, `PROJECT_UPDATED`, `PAYMENT_SUCCESS`, `INVOICE_GENERATED`).
- **Automation**: n8n Webhook Integration (`N8N_WEBHOOK_URL`) + WhatsApp Cloud API + Nodemailer (Gmail SMTP).
- **Payments**: Razorpay Gateway (Automated signatures & webhooks).
- **Security**: JWT Access/Refresh HttpOnly Cookies (`SameSite: None` in Prod), Rate Limiting, Helmet Security Headers, Central Error Handler, Activity Audit Logging.

---

## ⚡ Key System Features

### 1. Lead & Enquiry Management
- Instant lead capture with anti-spam duplicate suppression (15-minute window check).
- Automated customer confirmation emails via Nodemailer.
- Real-time event dispatch to n8n for Telegram / WhatsApp alerts and Google Sheets CRM sync.

### 2. Client Management & Portal
- Lead-to-Client conversion workflow.
- Secure client dashboard with project timeline tracking, invoice payments, and design previews.

### 3. Project & Milestone Management
- Real-time project tracker (`/track/:id`) with custom milestone updates and file uploads.
- Event emission on milestone status change (`PROJECT_UPDATED`, `PROJECT_COMPLETED`).

### 4. Financial & Invoicing Engine
- Razorpay order creation, payment signature verification, and automated payment receipts.
- Automatic invoice generation (`INV-2026-XXXX`) with tax breakdown and due dates.

### 5. Health Monitoring & Backups
- Diagnostic API endpoint (`GET /api/health`) monitoring database connectivity, memory usage, n8n webhook status, and service health.
- Database backup snapshot runner (`node server/scripts/backup.js`).

---

## 🔑 Environment Variables Configuration

Refer to `dev.hyd/server/.env.example` for all environment options:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Supabase PostgreSQL Connection String (Transaction pooler) |
| `DIRECT_URL` | Yes | Supabase Direct Connection String (Session pooler) |
| `JWT_SECRET` | Yes | 256-bit secret key for signing JWT access tokens |
| `JWT_REFRESH_SECRET` | Yes | 256-bit secret key for signing JWT refresh tokens |
| `RAZORPAY_KEY_ID` | Optional | Razorpay public key ID |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay private key secret |
| `SMTP_USER` | Optional | Gmail SMTP email address for sending client emails |
| `SMTP_PASS` | Optional | Gmail App Password for SMTP authentication |
| `N8N_WEBHOOK_URL` | Optional | External n8n webhook URL for receiving system events |
| `WHATSAPP_API_TOKEN` | Optional | WhatsApp Cloud API Bearer Access Token |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | WhatsApp Cloud API Phone Number ID |

---

## 🛠️ Quick Local Setup

```bash
# 1. Install Backend Dependencies & Generate Prisma Client
cd dev.hyd/server
npm install
npx prisma generate
npx prisma db push

# 2. Start Backend Server
npm run dev

# 3. Start Frontend App
cd ../client
npm install
npm run dev
```

---

## 📜 License
Privately owned by **dev.hyd**. All rights reserved.
