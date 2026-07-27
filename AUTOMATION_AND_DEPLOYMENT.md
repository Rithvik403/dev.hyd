# 🚀 dev.hyd — Production Automation & Deployment Guide (WhatsApp & Email)

This guide provides end-to-end documentation for the **dev.hyd** platform architecture, event-driven n8n automations, database configuration, and deployment checklists across **Vercel**, **Railway**, **Supabase**, and **n8n** (using **WhatsApp Cloud API** & **Gmail SMTP Email** only).

---

## 🏗️ System Architecture Overview

```
                         +-----------------------+
                         |     Client Browser    |
                         +-----------+-----------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
  +------------------------+                  +------------------------+
  |    Vercel Frontend     |                  |    Railway Backend     |
  |   (React 19 + Vite)    | ---------------> |    (Express + Node)    |
  +------------------------+                  +-----------+------------+
                                                          |
                                  +-----------------------+-----------------------+
                                  |                                               |
                                  v                                               v
                      +------------------------+                      +------------------------+
                      |  Supabase PostgreSQL   |                      |  n8n Automation Engine |
                      |     (Prisma ORM)       |                      | (10 Modular Workflows) |
                      +------------------------+                      +------------------------+
```

---

## ⚡ Event-Driven Automation Lifecycle

All core business logic executes securely inside Express. When key actions occur, Express emits typed system events that asynchronously dispatch payloads to n8n webhooks for automations:

```
Contact Form Submitted -> Express Saves to DB -> Emits CONTACT_CREATED -> Dispatches to n8n Webhook -> WhatsApp Cloud API + Customer Email + Google Sheets CRM
```

### Supported System Lifecycle Events:
1. `CONTACT_CREATED`: Website enquiry submitted.
2. `CONTACT_UPDATED`: Lead status modified by admin.
3. `CLIENT_CREATED`: Client account created in portal.
4. `CLIENT_UPDATED`: Client profile or phone number updated.
5. `PROJECT_CREATED`: New project milestone initialized.
6. `PROJECT_UPDATED`: Project status or deadline updated.
7. `PROJECT_COMPLETED`: Project marked completed or live.
8. `PAYMENT_CREATED`: Payment order generated.
9. `PAYMENT_SUCCESS`: Payment verified via Razorpay signature or webhook.
10. `PAYMENT_FAILED`: Payment attempt failed.
11. `INVOICE_CREATED`: Invoice generated for client.
12. `INVOICE_PAID`: Invoice paid.
13. `FILE_UPLOADED`: Design or project assets uploaded to storage.
14. `MESSAGE_SENT`: Client or admin sent message in portal.
15. `CLIENT_LOGIN`: Client logged into dashboard.
16. `ADMIN_LOGIN`: Admin logged into dashboard.
17. `USER_REGISTERED`: Self-service user registration.
18. `PASSWORD_RESET`: Password reset link requested or updated.

---

## 📁 Modular n8n Workflows (`server/n8n/`)

Import these ready-to-use n8n workflow JSON files into your n8n instance:

| Workflow File | Description & Channels Used |
|---|---|
| [`lead-management.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/lead-management.json) | Webhook -> Validates enquiry -> WhatsApp Cloud API alert -> Auto-reply email -> Google Sheets CRM |
| [`client-onboarding.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/client-onboarding.json) | Webhook -> Sends portal credentials & welcome email -> WhatsApp onboarding alert |
| [`project-management.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/project-management.json) | Webhook -> Milestone update -> Client status email -> WhatsApp milestone alert |
| [`payment-automation.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/payment-automation.json) | Webhook -> Payment captured -> Digital receipt email -> WhatsApp payment receipt |
| [`email-automation.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/email-automation.json) | Webhook -> Central router for transactional emails (Password reset, Welcome, Completion) |
| [`notification-center.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/notification-center.json) | Webhook -> Central hub for multi-channel WhatsApp Cloud API & Email alerts |
| [`daily-reminders.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/daily-reminders.json) | Schedule (9 AM IST) -> Health & daily briefing digest email sent to admin |
| [`analytics.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/analytics.json) | Schedule (Weekly) -> Aggregates lead conversion stats & revenue report email |
| [`backup.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/backup.json) | Schedule (Midnight) -> Database & file snapshot backup verification email |
| [`monitoring.json`](file:///c:/Users/Rithvik/OneDrive/Desktop/dev.hyd/dev.hyd/server/n8n/monitoring.json) | Schedule (15 Mins) -> Pings Express `/health` probe; sends urgent email on downtime |

---

## 📋 Comprehensive Deployment Checklists

### 1. 🚀 Production Deployment Checklist
- [x] Environment variables defined in `.env` for production.
- [x] Prisma database migrations generated and pushed (`npx prisma db push`).
- [x] Rate limiting configured on `/api` routes (300 requests per 15 mins).
- [x] Helmet security headers enabled (`crossOriginResourcePolicy: false`).
- [x] Webhook signature verification active for Razorpay and n8n.

### 2. 🚂 Railway (Backend) Checklist
- [x] Select `dev.hyd/server` as root directory.
- [x] Set Environment Variables:
  - `PORT=3000`
  - `NODE_ENV=production`
  - `CLIENT_URL=https://your-frontend.vercel.app`
  - `DATABASE_URL=postgresql://postgres.xxx:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
  - `DIRECT_URL=postgresql://postgres.xxx:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
  - `JWT_SECRET=your_jwt_secret_key`
  - `JWT_REFRESH_SECRET=your_jwt_refresh_secret_key`
  - `N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/devhyd-webhook`
  - `WHATSAPP_API_TOKEN=your_whatsapp_cloud_api_token`
  - `WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id`
- [x] Verify `/health` endpoint returns HTTP 200 OK.

### 3. ⚡ Vercel (Frontend) Checklist
- [x] Select `dev.hyd/client` as root directory.
- [x] Framework preset: Vite.
- [x] Build command: `npm run build`.
- [x] Output directory: `dist`.
- [x] Set Environment Variable:
  - `VITE_API_BASE_URL=https://your-railway-backend.up.railway.app`

### 4. 🗄️ Supabase (PostgreSQL) Checklist
- [x] Create project `dev.hyd` in Supabase.
- [x] Copy Pooled Connection string to `DATABASE_URL`.
- [x] Copy Direct Connection string to `DIRECT_URL`.
- [x] Run `npx prisma db push` to push schema with performance composite indexes.

### 5. 🤖 n8n Checklist (WhatsApp & Email)
- [x] Import all 10 workflow JSON files from `server/n8n/`.
- [x] Set Environment Variables in n8n:
  - `WHATSAPP_API_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `GOOGLE_SHEETS_ID`
- [x] Configure Gmail SMTP credentials for transactional auto-responders.
- [x] Activate all workflows (toggle active switch).

### 6. 🧪 Testing Checklist
- [x] **Enquiry Submission**: Submit contact form on landing page and verify:
  - Saved to PostgreSQL `Enquiry` table.
  - Event `CONTACT_CREATED` logged to `ActivityLog`.
  - WhatsApp notification & Email delivered to lead/admin.
- [x] **Client Auth**: Login with client credentials and verify JWT cookies exchanged.
- [x] **Razorpay Payment**: Trigger demo installment payment order and verify Hmac signature validation.
- [x] **Monitoring Probe**: Ping `/api/health` and verify database + n8n status reporting.
