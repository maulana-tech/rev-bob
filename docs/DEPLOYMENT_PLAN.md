# 🚀 Deployment Plan - DevTools AI Suite

**Date**: May 16, 2024  
**Application**: DevTools AI Suite (CDE-APP + DevTools)  
**Current Status**: Development (localhost)  
**Target**: Production deployment

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Options](#deployment-options)
3. [Recommended Setup](#recommended-setup)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Checklist](#security-checklist)
10. [Cost Estimation](#cost-estimation)
11. [Rollback Strategy](#rollback-strategy)

---

## 🏗️ Architecture Overview

### Current Architecture (Development)

```
┌─────────────────────────────────────────────────────────┐
│                   LOCAL MACHINE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vite + React)                                │
│  Port: 3000                                             │
│  http://localhost:3000/app/                             │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Backend (Express + TypeScript)                         │
│  Port: 3001                                             │
│  http://localhost:3001                                  │
│                                                          │
│  - 29 API endpoints                                     │
│  - Multi-LLM orchestration                              │
│  - GitHub integration                                   │
│  - In-memory storage                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Target Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                        USERS                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    CDN / CloudFlare                     │
│                  (SSL + DDoS Protection)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   LOAD BALANCER                         │
│                  (Optional - for scale)                 │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│    FRONTEND      │    │     BACKEND      │
│  Vercel/Netlify  │    │   Railway/Render │
│                  │    │                  │
│  - Vite build    │    │  - Express API   │
│  - Static assets │    │  - LLM calls     │
│  - SSR (optional)│    │  - GitHub API    │
└──────────────────┘    └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────┐    ┌──────────────────┐
        │    POSTGRESQL    │    │      REDIS       │
        │   (Supabase)     │    │   (Upstash)      │
        │                  │    │                  │
        │  - Graph data    │    │  - Cache         │
        │  - User data     │    │  - Sessions      │
        │  - Analytics     │    │  - Rate limiting │
        └──────────────────┘    └──────────────────┘
```

---

## 🌐 Deployment Options

### Option 1: Serverless (Recommended for Hackathon)

**Pros:**
- ✅ Easy to deploy
- ✅ Auto-scaling
- ✅ Pay per use
- ✅ Free tier available
- ✅ Minimal maintenance

**Cons:**
- ❌ Cold start latency
- ❌ Timeout limits
- ❌ Less control

**Platforms:**

| Component | Platform | Free Tier | Cost |
|-----------|----------|-----------|------|
| **Frontend** | Vercel | 100GB bandwidth | $0 - $20/mo |
| **Backend** | Railway | 500 hours | $0 - $5/mo |
| **Database** | Supabase | 500MB | $0 - $25/mo |
| **Cache** | Upstash | 10k commands/day | $0 - $10/mo |

**Total Cost:** $0 - $60/month

---

### Option 2: Container-based (Recommended for Production)

**Pros:**
- ✅ Full control
- ✅ Consistent environment
- ✅ Easy scaling
- ✅ No cold starts

**Cons:**
- ❌ More complex setup
- ❌ Higher cost
- ❌ More maintenance

**Platforms:**

| Component | Platform | Cost |
|-----------|----------|------|
| **Frontend** | AWS S3 + CloudFront | $5 - $20/mo |
| **Backend** | AWS ECS / Google Cloud Run | $20 - $100/mo |
| **Database** | AWS RDS / GCP Cloud SQL | $15 - $50/mo |
| **Cache** | AWS ElastiCache | $15 - $50/mo |

**Total Cost:** $55 - $220/month

---

### Option 3: Virtual Private Server (Budget Option)

**Pros:**
- ✅ Low cost
- ✅ Full control
- ✅ Simple setup

**Cons:**
- ❌ Manual scaling
- ❌ No auto-healing
- ❌ Single point of failure

**Platforms:**

| Component | Platform | Cost |
|-----------|----------|------|
| **All-in-one** | DigitalOcean Droplet | $12 - $24/mo |
| **All-in-one** | Linode | $12 - $24/mo |
| **All-in-one** | Hetzner | $5 - $15/mo |

**Total Cost:** $5 - $24/month

---

## ✅ Recommended Setup (Hackathon Demo)

### Phase 1: Quick Deploy (For Demo)

**Platform:** Vercel (Frontend) + Railway (Backend)

**Why:**
- ✅ Free tier sufficient for demo
- ✅ Deploy in < 30 minutes
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ✅ No credit card required (Vercel)

**Setup:**
```
Frontend: Vercel
  - Auto-deploy from main branch
  - Custom domain support
  - Edge caching
  - Analytics included

Backend: Railway
  - PostgreSQL included
  - Redis add-on available
  - Environment variables
  - Logs & monitoring
```

---

## 📝 Step-by-Step Deployment Guide

### Phase 1: Preparation

#### 1.1 Update Configuration

**Frontend (packages/web/vite.config.ts):**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

**Backend Environment Variables:**

```bash
# backend/.env.production
NODE_ENV=production
PORT=3001

# API Keys (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GROQ_API_KEY=gsk_xxx

# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_REDIRECT_URI=https://api.yourdomain.com/api/github/callback
GITHUB_TOKEN=ghp_xxx

# URLs
FRONTEND_URL=https://yourdomain.com
APP_URL=https://api.yourdomain.com

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis (if using cache)
REDIS_URL=redis://user:pass@host:6379
```

#### 1.2 Add Production Scripts

**Root package.json:**

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm web:dev\" \"pnpm backend:dev\"",
    "build": "pnpm web:build && pnpm backend:build",
    "web:build": "cd packages/web && pnpm build",
    "backend:build": "cd backend && pnpm build",
    "start": "concurrently \"pnpm web:start\" \"pnpm backend:start\"",
    "web:start": "cd packages/web && pnpm preview",
    "backend:start": "cd backend && node dist/index.js"
  }
}
```

**Backend package.json:**

```json
{
  "scripts": {
    "dev": "tsx watch index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js"
  }
}
```

#### 1.3 Create Dockerfiles (Optional)

**Backend Dockerfile:**

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build TypeScript
RUN pnpm build

# Expose port
EXPOSE 3001

# Start server
CMD ["pnpm", "start:prod"]
```

**Frontend Dockerfile:**

```dockerfile
# packages/web/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Phase 2: Deploy to Vercel (Frontend)

#### 2.1 Prepare Repository

```bash
# Push to GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### 2.2 Deploy to Vercel

1. **Sign up**: https://vercel.com
2. **Import Repository**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**:
   ```
   Framework Preset: Vite
   Root Directory: packages/web
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

5. **Deploy**: Click "Deploy"

6. **Custom Domain** (optional):
   - Go to Project Settings
   - Domains → Add your domain
   - Update DNS records

---

### Phase 3: Deploy to Railway (Backend)

#### 3.1 Sign Up & Create Project

1. **Sign up**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Select Repository**

#### 3.2 Configure Service

1. **Settings**:
   ```
   Root Directory: backend
   Start Command: pnpm start:prod
   ```

2. **Environment Variables**:
   - Add all variables from `.env.production`
   - Railway provides: DATABASE_URL, REDIS_URL

3. **Add PostgreSQL**:
   - Click "New" → Database → PostgreSQL
   - Automatically adds DATABASE_URL

4. **Add Redis** (optional):
   - Click "New" → Database → Redis
   - Automatically adds REDIS_URL

5. **Generate Domain**:
   - Railway provides: `xxx.railway.app`
   - Or add custom domain

#### 3.3 Deploy

```bash
# Railway CLI (alternative)
npm i -g @railway/cli
railway login
railway link
railway up
```

---

### Phase 4: Database Setup (Optional)

#### Option A: Use Supabase

```bash
# 1. Sign up at https://supabase.com
# 2. Create new project
# 3. Get connection string

# 4. Update backend/.env.production
DATABASE_URL=postgresql://postgres:xxx@xxx.supabase.co:5432/postgres

# 5. Create tables
psql $DATABASE_URL < schema.sql
```

**Schema (backend/schema.sql):**

```sql
-- Graph data
CREATE TABLE graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_graphs_repo ON graphs(repo_url);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_analytics_type ON analytics(event_type);
```

#### Option B: Use Railway PostgreSQL

```bash
# Railway automatically provisions PostgreSQL
# DATABASE_URL is added to environment variables
# No additional configuration needed
```

---

### Phase 5: Configure CI/CD

#### GitHub Actions (Automated Deployment)

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint || true
      
      - name: Type check
        run: |
          cd packages/web && pnpm tsc --noEmit
          cd ../../backend && pnpm tsc --noEmit

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/web
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

---

## 🔐 Security Checklist

### Pre-Deployment

- [ ] Remove all console.log statements
- [ ] Add rate limiting
- [ ] Enable CORS with whitelist
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use HTTPS only
- [ ] Set secure cookie flags
- [ ] Add CSP headers
- [ ] Enable CSRF protection
- [ ] Use environment variables for secrets
- [ ] Rotate API keys
- [ ] Set up monitoring
- [ ] Add error logging (no sensitive data)
- [ ] Configure firewall rules
- [ ] Enable DDoS protection

### Post-Deployment

- [ ] Test all endpoints
- [ ] Check SSL certificate
- [ ] Verify CORS settings
- [ ] Test authentication flow
- [ ] Monitor error rates
- [ ] Set up alerts
- [ ] Review logs
- [ ] Backup database
- [ ] Document API keys
- [ ] Create incident response plan

---

## 📊 Monitoring & Logging

### Recommended Services

**Application Monitoring:**
- ✅ **Sentry** - Error tracking
- ✅ **LogRocket** - Session replay
- ✅ **Datadog** - APM monitoring

**Logs:**
- ✅ **Better Stack (Logtail)** - Log aggregation
- ✅ **Railway Logs** - Built-in logging

**Uptime Monitoring:**
- ✅ **UptimeRobot** - Free uptime checks
- ✅ **Pingdom** - Advanced monitoring

**Analytics:**
- ✅ **PostHog** - Product analytics
- ✅ **Plausible** - Privacy-friendly analytics

### Implementation

**Backend (backend/index.ts):**

```typescript
import * as Sentry from "@sentry/node";

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

// Error handler
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
```

---

## 💰 Cost Estimation

### Scenario 1: Hackathon Demo (Free Tier)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 | Free tier (100GB bandwidth) |
| Railway | $0 | Free tier (500 hours) |
| Supabase | $0 | Free tier (500MB) |
| Upstash Redis | $0 | Free tier (10k commands) |
| CloudFlare | $0 | Free tier |
| **Total** | **$0/month** | ✅ Perfect for demo |

### Scenario 2: Production (Low Traffic)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Pro | $20 | Unlimited bandwidth |
| Railway | $5 | 1GB RAM, 1 vCPU |
| Supabase | $25 | 8GB storage, 2GB RAM |
| Upstash Redis | $10 | 1M commands |
| CloudFlare Pro | $20 | DDoS protection |
| Sentry | $26 | Error tracking |
| **Total** | **$106/month** | ~100 daily active users |

### Scenario 3: Production (High Traffic)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Enterprise | $150 | Custom |
| Railway | $50 | 4GB RAM, 2 vCPU |
| Supabase Pro | $50 | 100GB storage |
| Upstash Redis | $50 | 10M commands |
| CloudFlare Business | $200 | Enterprise DDoS |
| Sentry | $80 | Advanced features |
| **Total** | **$580/month** | ~1000 daily active users |

---

## 🔄 Rollback Strategy

### Quick Rollback (Vercel/Railway)

**Vercel:**
```bash
# View deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

**Railway:**
```bash
# View deployments
railway status

# Rollback via dashboard
# Projects → Deployments → Select previous → Rollback
```

### Git Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Auto-redeploys previous version
```

### Database Rollback

```bash
# Restore from backup
pg_restore --clean --dbname=$DATABASE_URL backup.sql
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Run tests locally
- [ ] Build project locally
- [ ] Update documentation
- [ ] Review environment variables
- [ ] Check API keys are valid
- [ ] Test GitHub OAuth locally
- [ ] Backup current data
- [ ] Create rollback plan

### Deployment

- [ ] Deploy backend first
- [ ] Test backend endpoints
- [ ] Deploy frontend
- [ ] Test frontend loads
- [ ] Test end-to-end flows
- [ ] Check SSL certificate
- [ ] Verify custom domain
- [ ] Test GitHub OAuth flow

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check response times
- [ ] Test all major features
- [ ] Verify analytics tracking
- [ ] Update DNS records
- [ ] Notify team
- [ ] Document any issues
- [ ] Create post-mortem (if issues)

---

## 🚀 Quick Deploy (For Hackathon)

### Option A: Deploy with Vercel + Railway (30 minutes)

**Step 1: Backend to Railway**
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to railway.app
# 3. New Project → Deploy from GitHub
# 4. Select repository
# 5. Add environment variables
# 6. Deploy!
```

**Step 2: Frontend to Vercel**
```bash
# 1. Go to vercel.com
# 2. Import from GitHub
# 3. Select repository
# 4. Configure: Root = packages/web
# 5. Add VITE_API_URL
# 6. Deploy!
```

**Done!** Your app is live.

### Option B: Deploy with Docker (1 hour)

```bash
# 1. Build images
docker build -t devtools-backend ./backend
docker build -t devtools-frontend ./packages/web

# 2. Push to registry
docker push your-registry/devtools-backend
docker push your-registry/devtools-frontend

# 3. Deploy to cloud provider
# (DigitalOcean, AWS, GCP, etc.)
```

---

## 📝 Summary

**Recommended for Hackathon:**
- ✅ **Frontend**: Vercel (Free tier)
- ✅ **Backend**: Railway (Free tier)
- ✅ **Database**: Supabase (Free tier)
- ✅ **Cost**: $0/month
- ✅ **Deploy Time**: ~30 minutes
- ✅ **Auto HTTPS**: Yes
- ✅ **Auto Deploy**: Yes

**Recommended for Production:**
- ✅ **Frontend**: Vercel Pro ($20/mo)
- ✅ **Backend**: Railway ($5-50/mo)
- ✅ **Database**: Supabase ($25/mo)
- ✅ **Cache**: Upstash ($10/mo)
- ✅ **Monitoring**: Sentry ($26/mo)
- ✅ **Total**: ~$106/month

**Next Steps:**
1. Choose deployment platform
2. Configure environment variables
3. Deploy backend first
4. Deploy frontend
5. Test everything
6. Monitor and optimize

---

**Ready to deploy?** Follow the step-by-step guide above! 🚀
