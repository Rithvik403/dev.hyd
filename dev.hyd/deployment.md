# 🚀 Production Deployment Guide — dev.hyd

This document provides step-by-step instructions to deploy the **dev.hyd** web application to production using **Vercel** (Frontend), **Railway** (Backend), and **Supabase** (PostgreSQL Database).

---

## 🏗️ Architecture Summary

```
                 +-----------------------+
                 |    Client Browser     |
                 +-----------+-----------+
                             |
             +---------------+---------------+
             |                               |
             v                               v
+------------------------+      +------------------------+
|    Vercel Frontend     |      |    Railway Backend     |
|   (React 19 + Vite)    | ---> |    (Express + Node)    |
+------------------------+      +-----------+------------+
                                            |
                                            v
                                +------------------------+
                                |  Supabase PostgreSQL   |
                                |     (Prisma ORM)       |
                                +------------------------+
```

---

## 🗄️ 1. Database Setup (Supabase PostgreSQL)

1. Sign in to [Supabase](https://supabase.com).
2. Create a new project named `dev.hyd`.
3. Under **Project Settings -> Database**, copy:
   - **Transaction Connection String (Pooled)**: Use as `DATABASE_URL`
   - **Direct Connection String**: Use as `DIRECT_URL`
4. Run Prisma schema migration from your local machine:
   ```bash
   cd server
   npx prisma db push
   ```

---

## 🚂 2. Backend Deployment (Railway)

1. Sign in to [Railway](https://railway.app).
2. Click **New Project -> Deploy from GitHub repo**.
3. Select your repository and choose the `server/` directory (or use the root `railway.json`).
4. Set the following **Variables** in Railway settings:
   ```env
   PORT=3000
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   DATABASE_URL=postgresql://postgres.xxx:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   DIRECT_URL=postgresql://postgres.xxx:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   ADMIN_EMAIL=dev.hyd.official@gmail.com
   ADMIN_PASSWORD=admin123
   NOTIFY_EMAIL=dev.hyd.official@gmail.com
   ```
5. **Default Admin Login Credentials**:
   - **Login URL**: `/admin/login`
   - **Email**: `dev.hyd.official@gmail.com`
   - **Password**: `admin123`
   - *(Alternative)*: `admin@devhyd.com` (pass: `admin123`)
6. Railway will automatically build and deploy.
7. Verify deployment by opening: `https://your-railway-app.up.railway.app/api/health`
   - Expected response: `{"status":"ok","environment":"production",...}`

---

## ⚡ 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New -> Project** and select your GitHub repository.
3. Set **Root Directory** to `client` (or use root monorepo).
4. Build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-railway-app.up.railway.app`
6. Click **Deploy**.
7. Vercel will build the React SPA and generate your live domain!

---

## 🔄 4. Post-Deployment Verification

1. Open your Vercel URL (e.g. `https://dev-hyd.vercel.app`).
2. Test lead forms (WhatsApp / Gmail Compose actions).
3. Test Admin Portal (`/admin/login`).
4. Test Client Portal (`/client/login`).
5. Test Public Project Tracker (`/track-project`).
