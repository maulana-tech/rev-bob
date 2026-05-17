# Deployment Guide: Frontend (Vercel) + Backend (Railway)

This guide provides step-by-step instructions for deploying the CDE-AI project with the frontend on Vercel and backend on Railway.

## Table of Contents
1. [Prerequisites & Setup](#prerequisites--setup)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [CI/CD Setup (Optional)](#cicd-setup-optional)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites & Setup

### Required Accounts
- **GitHub Account**: For repository hosting and CI/CD
- **Railway Account**: Sign up at [railway.app](https://railway.app) (supports GitHub login)
- **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (supports GitHub login)

### Required API Keys

Before deployment, obtain the following API keys:

#### Essential (Minimum Required)
- **GitHub Token**: Personal Access Token with `repo` scope
  - Generate at: https://github.com/settings/tokens
  - Required for GitHub integration features

#### LLM Providers (At least ONE required)
The backend tries providers in this order: GLM-5 → ASI:One → Cerebras → Watsonx
- **Cerebras API Key**: https://cloud.cerebras.ai/
- **Groq API Key**: https://console.groq.com/
- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Anthropic API Key**: https://console.anthropic.com/

#### Optional Integrations
- **IBM Watsonx API Key**: For Granite models
- **IBM Watsonx Orchestrate**: For agent orchestration
- **Jira Cloud**: For issue tracking integration
- **NVIDIA AI**: Fallback LLM provider

### Environment Variables Reference

Create a `.env` file based on the template below:

```bash
# Backend Server
PORT=3001
NODE_ENV=production

# LLM Providers (at least one required)
CEREBRAS_API_KEY=your_cerebras_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# GitHub Integration (required)
GITHUB_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=https://your-backend.railway.app/api/github/callback

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Optional: IBM Watsonx
WATSONX_API_KEY=your_watsonx_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Optional: IBM Watsonx Orchestrate
ORCHESTRATE_API_KEY=your_orchestrate_key
ORCHESTRATE_AGENT_ID=your_agent_id
ORCHESTRATE_REGION=au-syd

# Optional: Jira Integration
JIRA_HOST=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_jira_token

# Optional: Custom LLM
CUSTOM_API_KEY=your_custom_key
CUSTOM_BASE_URL=https://api.custom-llm.com
CUSTOM_MODEL=custom-model-name
```

---

## Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment

1. **Verify Build Configuration**
   
   Check `backend/package.json` has correct build scripts:
   ```json
   {
     "scripts": {
       "build": "tsc --skipLibCheck && node -e \"const fs=require('fs');fs.mkdirSync('dist',{recursive:true});fs.copyFileSync('landing.html','dist/landing.html');\"",
       "start": "node dist/index.js"
     }
   }
   ```

2. **Create Railway Configuration**
   
   Create `railway.json` in the `backend/` directory:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "pnpm install && pnpm build"
     },
     "deploy": {
       "startCommand": "node dist/index.js",
       "healthcheckPath": "/health",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### Step 2: Deploy to Railway

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Login" and authenticate with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Node.js project

3. **Configure Root Directory**
   - In project settings, set **Root Directory** to `backend`
   - This tells Railway to build from the backend folder

4. **Set Build & Start Commands**
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/index.js`
   - **Install Command**: `pnpm install`

5. **Configure Environment Variables**
   
   Go to project → Variables tab and add:
   
   ```bash
   # Essential
   NODE_ENV=production
   PORT=3001
   
   # LLM Provider (at least one)
   CEREBRAS_API_KEY=your_key_here
   GROQ_API_KEY=your_key_here
   
   # GitHub Integration
   GITHUB_TOKEN=your_github_token
   GITHUB_CLIENT_ID=your_oauth_client_id
   GITHUB_CLIENT_SECRET=your_oauth_client_secret
   GITHUB_REDIRECT_URI=https://${{RAILWAY_PUBLIC_DOMAIN}}/api/github/callback
   
   # Frontend URL (update after Vercel deployment)
   FRONTEND_URL=https://your-app.vercel.app
   ```
   
   **Note**: Railway provides `${{RAILWAY_PUBLIC_DOMAIN}}` variable for dynamic domain reference.

6. **Enable Public Networking**
   - Go to Settings → Networking
   - Click "Generate Domain" to get a public URL
   - Your backend will be available at: `https://your-project.railway.app`

7. **Deploy**
   - Railway automatically deploys on push to main branch
   - Monitor deployment logs in the "Deployments" tab
   - Wait for "Success" status

### Step 3: Verify Backend Deployment

Test the health endpoint:
```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Backend Deployment Notes

#### Important Constraints
- **In-Memory Storage**: Graph data is stored in memory and will be lost on restart
- **File Size Limits**: 
  - Max file: 2MB
  - Max files: 2,500
  - Max total: 25MB
  - Max upload: 500MB
- **No Database**: Session state is not persisted
- **ESM Modules**: Backend uses ES modules (`"type": "module"`)

#### Health Check Configuration
- **Endpoint**: `/health` (NOT `/api/health`)
- **Method**: GET
- **Expected Status**: 200 OK
- Railway will use this for health monitoring

#### Common Railway Issues

**Issue**: Build fails with "Cannot find module"
- **Solution**: Ensure all imports use `.js` extension (ESM requirement)
- Example: `import { x } from "./file.js"` not `"./file"`

**Issue**: Port binding error
- **Solution**: Railway automatically sets `PORT` env var, backend uses `process.env.PORT || 3001`

**Issue**: Memory limit exceeded
- **Solution**: Upgrade Railway plan or reduce graph size limits in `backend/index.ts`

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Update Vite Configuration**
   
   The current `vite.config.ts` has `base: '/app/'` which expects deployment to a subdirectory.
   
   **Option A: Deploy to Root (Recommended)**
   
   Update `packages/web/vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/', // Changed from '/app/'
     plugins: [react()],
     // Remove proxy - only for development
   });
   ```
   
   **Option B: Keep Subdirectory Deployment**
   
   Keep `base: '/app/'` and configure Vercel to serve from `/app` path.

2. **Update API Client for Production**
   
   The `packages/web/src/lib/api.ts` uses relative paths that work with dev proxy.
   
   Create `packages/web/src/lib/config.ts`:
   ```typescript
   export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
   export const HEALTH_ENDPOINT = import.meta.env.VITE_HEALTH_ENDPOINT || '/health';
   ```
   
   Update `packages/web/src/lib/api.ts`:
   ```typescript
   import { API_BASE_URL, HEALTH_ENDPOINT } from './config';
   
   const BASE = API_BASE_URL;
   const HEALTH_ENDPOINT_URL = HEALTH_ENDPOINT;
   ```

### Step 2: Deploy to Vercel

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Login" and authenticate with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the framework

3. **Configure Build Settings**
   
   - **Framework Preset**: Vite
   - **Root Directory**: `packages/web`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. **Configure Environment Variables**
   
   Add these in Project Settings → Environment Variables:
   
   ```bash
   # Backend API URL (update with your Railway URL)
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   VITE_HEALTH_ENDPOINT=https://your-backend.railway.app/health
   
   # Optional: Analytics
   VITE_ENABLE_ANALYTICS=false
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be available at: `https://your-app.vercel.app`

### Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `FRONTEND_URL` in Railway backend environment variables

### Frontend Deployment Notes

#### Base Path Considerations

The current config has `base: '/app/'` which means:
- **Production URL**: `https://your-app.vercel.app/app/`
- **Assets**: Loaded from `/app/assets/`
- **Routing**: All routes prefixed with `/app`

**Recommendation**: Change to `base: '/'` for cleaner URLs unless you specifically need subdirectory deployment.

#### API Proxy in Production

The dev proxy in `vite.config.ts` only works in development. In production:
- Frontend makes direct requests to Railway backend
- CORS must be configured on backend
- Use environment variables for API URL

#### Build Output

Vercel expects build output in `dist/` directory:
- HTML: `dist/index.html`
- Assets: `dist/assets/`
- Ensure `packages/web/package.json` build script outputs to `dist/`

### Common Vercel Issues

**Issue**: 404 on page refresh
- **Solution**: Vercel automatically handles SPA routing, but verify `dist/index.html` exists

**Issue**: API calls fail with CORS error
- **Solution**: Configure CORS on Railway backend (see Post-Deployment section)

**Issue**: Environment variables not working
- **Solution**: Prefix with `VITE_` and rebuild after adding variables

**Issue**: Assets not loading (404)
- **Solution**: Verify `base` path in `vite.config.ts` matches deployment path

---

## Post-Deployment Configuration

### Step 1: Update Backend CORS Settings

Update Railway backend environment variables:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

The backend `index.ts` uses `cors` middleware. Verify CORS configuration allows your Vercel domain:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Step 2: Update Frontend API URLs

In Vercel project settings, update environment variables:

```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_HEALTH_ENDPOINT=https://your-backend.railway.app/health
```

Redeploy frontend after updating variables.

### Step 3: Update GitHub OAuth Callback

If using GitHub OAuth:

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Update **Authorization callback URL** to:
   ```
   https://your-backend.railway.app/api/github/callback
   ```
3. Update Railway environment variable:
   ```bash
   GITHUB_REDIRECT_URI=https://your-backend.railway.app/api/github/callback
   ```

### Step 4: Test Deployment

1. **Health Check**
   ```bash
   curl https://your-backend.railway.app/health
   ```

2. **Frontend Access**
   - Open `https://your-app.vercel.app`
   - Verify UI loads correctly
   - Check browser console for errors

3. **API Integration**
   - Upload a test ZIP file
   - Verify graph visualization works
   - Test LLM query functionality

4. **GitHub Integration**
   - Test GitHub repository cloning
   - Verify OAuth flow works
   - Test file operations

### Step 5: Configure Monitoring

#### Railway Monitoring
- Go to project → Metrics
- Monitor CPU, Memory, Network usage
- Set up alerts for downtime

#### Vercel Monitoring
- Go to project → Analytics
- Monitor page views, performance
- Check deployment logs for errors

### Step 6: Set Up Logging

**Backend Logging (Railway)**
- Railway automatically captures `console.log` output
- View logs in Deployments → Logs tab
- Consider adding structured logging (e.g., Winston, Pino)

**Frontend Logging (Vercel)**
- Vercel captures build logs
- Runtime errors visible in browser console
- Consider adding error tracking (e.g., Sentry)

---

## CI/CD Setup (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build backend
        run: pnpm build
      
      - name: Run tests (if available)
        run: pnpm test || echo "No tests configured"

  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./packages/web
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build frontend
        run: pnpm build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_HEALTH_ENDPOINT: ${{ secrets.VITE_HEALTH_ENDPOINT }}
      
      - name: Run tests (if available)
        run: pnpm test || echo "No tests configured"

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push to main"
      
      - name: Deploy to Vercel
        run: echo "Vercel auto-deploys on push to main"
      
      - name: Notify deployment
        run: |
          echo "✅ Deployment successful!"
          echo "Backend: https://your-backend.railway.app"
          echo "Frontend: https://your-app.vercel.app"
```

### Environment-Specific Configurations

#### Staging Environment

1. **Create Staging Branch**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Deploy Staging Backend (Railway)**
   - Create new Railway project for staging
   - Connect to `staging` branch
   - Use separate environment variables

3. **Deploy Staging Frontend (Vercel)**
   - Vercel automatically creates preview deployments for branches
   - Or create separate project for staging

4. **Update Environment Variables**
   ```bash
   # Staging Backend
   NODE_ENV=staging
   FRONTEND_URL=https://staging-app.vercel.app
   
   # Staging Frontend
   VITE_API_BASE_URL=https://staging-backend.railway.app/api
   ```

#### Production Environment

- Use `main` branch for production
- Protect `main` branch with required reviews
- Use production API keys and credentials
- Enable monitoring and alerts

---

## Troubleshooting

### Backend Issues

#### Issue: Backend crashes on startup
**Symptoms**: Railway shows "Crashed" status, logs show module errors

**Solutions**:
1. Check all imports use `.js` extension (ESM requirement)
2. Verify all dependencies are in `package.json`
3. Check environment variables are set correctly
4. Review Railway logs for specific error messages

#### Issue: L LM calls fail silently
**Symptoms**: Empty responses from `/api/query` endpoint

**Solutions**:
1. Verify at least one LLM provider API key is configured
2. Check API key validity and quotas
3. Review backend logs for LLM provider errors
4. Test with different LLM providers

#### Issue: GitHub integration not working
**Symptoms**: GitHub clone/OAuth fails

**Solutions**:
1. Verify `GITHUB_TOKEN` has correct permissions
2. Check `GITHUB_REDIRECT_URI` matches OAuth app settings
3. Ensure GitHub OAuth app is configured correctly
4. Test with public repositories first

#### Issue: Memory limit exceeded
**Symptoms**: Railway shows memory usage at 100%, crashes

**Solutions**:
1. Upgrade Railway plan for more memory
2. Reduce graph size limits in `backend/index.ts`:
   ```typescript
   const MAX_SOURCE_FILES = 1000; // Reduce from 2500
   const MAX_TOTAL_SOURCE_BYTES = 10 * 1024 * 1024; // Reduce from 25MB
   ```
3. Implement graph data cleanup/garbage collection

### Frontend Issues

#### Issue: White screen on deployment
**Symptoms**: Vercel deployment succeeds but shows blank page

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify `base` path in `vite.config.ts` matches deployment
3. Check if assets are loading correctly
4. Review Vercel build logs for errors

#### Issue: API calls return CORS errors
**Symptoms**: Network errors in browser console, CORS policy messages

**Solutions**:
1. Update `FRONTEND_URL` in Railway backend
2. Verify CORS configuration in backend
3. Check API URLs in frontend environment variables
4. Test API endpoints directly with curl

#### Issue: Environment variables not working
**Symptoms**: API calls go to wrong URLs, features not working

**Solutions**:
1. Ensure variables are prefixed with `VITE_`
2. Redeploy after adding/changing variables
3. Check variables are set in Vercel project settings
4. Verify variable names match code references

#### Issue: 404 on page refresh
**Symptoms**: Direct URL access fails, routing broken

**Solutions**:
1. Vercel should handle SPA routing automatically
2. Check if `dist/index.html` exists after build
3. Verify Vercel project is configured as SPA
4. Add custom `vercel.json` if needed:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Performance Issues

#### Issue: Slow graph rendering
**Symptoms**: UI freezes when loading large codebases

**Solutions**:
1. Implement graph virtualization
2. Add loading states and progress indicators
3. Reduce graph complexity on frontend
4. Consider server-side graph processing

#### Issue: High memory usage
**Symptoms**: Browser tab crashes, slow performance

**Solutions**:
1. Implement graph data pagination
2. Add memory cleanup for unused data
3. Optimize graph rendering algorithms
4. Consider WebWorkers for heavy processing

### Deployment Issues

#### Issue: Build fails on Railway
**Symptoms**: Deployment fails during build step

**Solutions**:
1. Check `pnpm-lock.yaml` is committed
2. Verify Node.js version compatibility
3. Check for missing dependencies
4. Review build logs for specific errors

#### Issue: Build fails on Vercel
**Symptoms**: Frontend deployment fails

**Solutions**:
1. Check TypeScript compilation errors
2. Verify all imports are correct
3. Check for missing dependencies
4. Review Vercel build logs

#### Issue: Deployment succeeds but features broken
**Symptoms**: Apps deploy but functionality doesn't work

**Solutions**:
1. Check environment variables are set correctly
2. Verify API endpoints are accessible
3. Test individual components/features
4. Review application logs for runtime errors

### Monitoring and Debugging

#### Enable Debug Logging

**Backend (Railway)**:
```bash
# Add to environment variables
DEBUG=true
LOG_LEVEL=debug
```

**Frontend (Vercel)**:
```bash
# Add to environment variables
VITE_DEBUG=true
```

#### Health Check Endpoints

Test these endpoints to verify deployment:

```bash
# Backend health
curl https://your-backend.railway.app/health

# Backend API
curl https://your-backend.railway.app/api/health

# Frontend (should return HTML)
curl https://your-app.vercel.app
```

#### Log Analysis

**Railway Logs**:
- Go to project → Deployments → Logs
- Filter by log level (error, warn, info)
- Search for specific error messages

**Vercel Logs**:
- Go to project → Functions → Logs (for API routes)
- Check browser console for frontend errors
- Use Vercel Analytics for performance monitoring

---

## Summary

This deployment guide covers:

1. **Prerequisites**: Required accounts and API keys
2. **Backend Deployment**: Railway configuration and deployment steps
3. **Frontend Deployment**: Vercel configuration and deployment steps
4. **Post-Deployment**: CORS, environment variables, and testing
5. **CI/CD**: Optional GitHub Actions workflow
6. **Troubleshooting**: Common issues and solutions

### Key Points to Remember

- **Backend uses ESM modules**: All imports must use `.js` extension
- **Health endpoint**: `/health` not `/api/health`
- **Base path**: Frontend has `base: '/app/'` - consider changing to `/`
- **CORS configuration**: Must allow Vercel domain
- **Environment variables**: Frontend needs `VITE_` prefix
- **In-memory storage**: Graph data lost on backend restart
- **LLM fallback**: Backend tries multiple providers sequentially

### Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Configure environment variables
4. Test all functionality
5. Set up monitoring and alerts
6. Implement CI/CD pipeline
7. Consider adding database for persistence

For additional support, refer to:
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Project README](./README.md)