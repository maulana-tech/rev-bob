# Railway Deployment Guide

This guide explains how to deploy the DevTools AI Suite backend to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository
- All API keys ready (see Environment Variables section)

## Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Connect Repository to Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Select the `backend` folder as root directory

2. **Configure Build**
   - Railway will auto-detect Node.js and use `nixpacks.toml`
   - Build command: `pnpm build`
   - Start command: `node dist/index.js`

3. **Set Environment Variables** (see below)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your Railway URL (e.g., `https://your-backend.railway.app`)

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd backend
railway link

# Deploy
railway up
```

## Environment Variables

Set these in Railway Dashboard → Variables:

### Required

```bash
# Server
PORT=3001
NODE_ENV=production

# Frontend URL (IMPORTANT: Your Vercel URL)
FRONTEND_URL=https://your-frontend.vercel.app
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# At least ONE LLM provider (recommended: NVIDIA AI for free tier)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxx
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
```

### Optional LLM Providers

```bash
# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# OpenAI (GPT)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Groq (Fast inference)
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Cerebras (Fast inference)
CEREBRAS_API_KEY=csk-xxxxxxxxxxxxx

# Google (Gemini)
GOOGLE_API_KEY=AIzaxxxxxxxxxxxxx
```

### IBM watsonx Integration

```bash
# IBM watsonx.ai (Granite models)
WATSONX_API_KEY=your_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# IBM watsonx Orchestrate (Deployed Agent)
ORCHESTRATE_API_KEY=your_api_key
ORCHESTRATE_AGENT_ID=cb3cf0d3-1441-43b6-b8f4-05e08642c936
ORCHESTRATE_URL=https://au-syd.watson-orchestrate.cloud.ibm.com
```

### Integrations

```bash
# Jira Cloud
JIRA_HOST=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=ATATTxxxxxxxxxxxxx

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_CLIENT_ID=Ov23lixxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxx
GITHUB_REDIRECT_URI=${{RAILWAY_PUBLIC_DOMAIN}}/api/github/callback
```

## Railway-Specific Variables

Railway provides these automatically:
- `RAILWAY_PUBLIC_DOMAIN` - Your public URL
- `PORT` - Assigned port (default: 3001)

Use them like this:
```bash
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
GITHUB_REDIRECT_URI=https://${{RAILWAY_PUBLIC_DOMAIN}}/api/github/callback
```

## Build Configuration

Railway uses the following files:

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node dist/index.js"
```

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Verify Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-backend.railway.app/health
# Expected: {"status":"ok"}

# Orchestrate proxy status
curl https://your-backend.railway.app/api/orchestrate-proxy/status
# Expected: {"configured":true,"agentId":"...","message":"..."}

# Test chat (if NVIDIA_API_KEY set)
curl -X POST https://your-backend.railway.app/api/orchestrate-proxy/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
# Expected: {"status":"success","response":"...","_mode":"nvidia_ai"}
```

## Update Frontend to Use Railway Backend

After deploying backend to Railway, update your Vercel frontend environment variables:

```bash
# In Vercel Dashboard → Settings → Environment Variables
VITE_API_URL=https://your-backend.railway.app
```

Or update `packages/web/src/components/SimpleChat.tsx`:

```typescript
// Replace
const response = await fetch('http://localhost:3001/api/orchestrate-proxy/chat', {

// With
const response = await fetch('https://your-backend.railway.app/api/orchestrate-proxy/chat', {
```

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Ensure `pnpm install` runs before `pnpm build`
- Check `package.json` dependencies

**Error: "TypeScript compilation failed"**
- Railway uses `tsc --skipLibCheck` to ignore type errors
- Fix TypeScript errors locally first

### Runtime Errors

**Error: "Port already in use"**
- Railway sets `PORT` automatically
- Ensure `index.ts` uses `process.env.PORT`

**Error: "CORS policy"**
- Set `FRONTEND_URL` to your Vercel URL
- Check CORS configuration in `index.ts`

**Error: "API key not configured"**
- Verify environment variables in Railway Dashboard
- At least one LLM provider must be configured

### Check Logs

```bash
# Via Railway CLI
railway logs

# Via Railway Dashboard
Project → Deployments → View Logs
```

## Custom Domain (Optional)

1. Go to Railway Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your custom domain (e.g., `api.yourapp.com`)
4. Add CNAME record to your DNS:
   ```
   CNAME api your-backend.railway.app
   ```
5. Update `FRONTEND_URL` and `APP_URL` to use custom domain

## Monitoring

Railway provides:
- CPU/Memory usage graphs
- Deployment history
- Real-time logs
- Restart policies

Access via: Railway Dashboard → Your Project → Observability

## Cost Optimization

Railway free tier includes:
- $5 free credits per month
- 500 hours of usage
- Automatic sleep after 30 minutes of inactivity

To minimize costs:
1. Use NVIDIA AI (free tier) instead of paid LLM providers
2. Enable auto-sleep in Railway settings
3. Monitor usage in Railway Dashboard

## Security Best Practices

1. **Never commit `.env` file** - Use Railway environment variables
2. **Rotate API keys regularly** - Update in Railway Dashboard
3. **Use HTTPS only** - Railway provides SSL automatically
4. **Enable rate limiting** - Consider adding rate limiting middleware
5. **Monitor logs** - Check for suspicious activity

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/your-repo/issues

---

**Status**: Production Ready ✅  
**Last Updated**: 2026-05-17
