# 🔧 Troubleshooting Guide

**DevTools AI Suite** - Common issues and solutions

---

## 🚨 Common Issues

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
Error: listen EADDRINUSE: address already in use :::3002
```

**Cause:** Previous server process still running

**Solution:**

```bash
# Kill all dev servers
lsof -ti:3000,3001,3002 | xargs kill -9

# Restart
pnpm dev
```

**Prevention:** 
- Always stop servers properly (Ctrl+C)
- Added error handling in MCP server (fixed ✅)

---

### Issue 2: Frontend Can't Connect to Backend

**Error:**
```
[vite] http proxy error: /api/xxx
AggregateError [ECONNREFUSED]
```

**Cause:** Backend not running or wrong proxy configuration

**Solution:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok"}
   ```

2. **Check proxy config** (`packages/web/vite.config.ts`):
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'http://127.0.0.1:3001',
         changeOrigin: true,
         secure: false
       }
     }
   }
   ```

3. **Restart both servers:**
   ```bash
   pnpm dev
   ```

---

### Issue 3: GitHub Authentication Not Working

**Error:**
```
{"error":"Not authenticated","authenticated":false}
```

**Possible Causes:**

1. **GitHub token not set**
   ```bash
   # Check backend/.env
   GITHUB_TOKEN=ghp_xxx  # Should exist
   ```

2. **Backend not restarted after env change**
   ```bash
   # Restart backend
   lsof -ti:3001 | xargs kill -9
   pnpm backend:dev
   ```

3. **Invalid token**
   ```bash
   # Test token manually
   curl -H "Authorization: token ghp_xxx" https://api.github.com/user
   # Should return your GitHub user info
   ```

**Solution:**

1. Verify token is valid
2. Check `.env` file has `GITHUB_TOKEN`
3. Restart backend
4. Test: `curl http://localhost:3001/api/github/me`

---

### Issue 4: ESM Module Errors

**Error:**
```
ReferenceError: __dirname is not defined in ES module scope
```

**Cause:** Using CommonJS syntax in ESM modules

**Solution:** Already fixed ✅

```typescript
// Added to backend/index.ts
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

### Issue 5: TypeScript Build Errors

**Error:**
```
error TS2307: Cannot find module 'xxx'
```

**Solution:**

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript config
cd backend && pnpm tsc --noEmit
cd ../packages/web && pnpm tsc --noEmit
```

---

### Issue 6: Frontend Not Loading

**Error:** Blank page or "Cannot GET /app/"

**Possible Causes:**

1. **Wrong base path in vite.config.ts**
   ```typescript
   // Should be:
   base: '/app/',  // With trailing slash
   ```

2. **Build not created**
   ```bash
   cd packages/web
   pnpm build
   ls dist/  # Should have files
   ```

3. **Wrong URL**
   - ✅ Correct: http://localhost:3000/app/
   - ❌ Wrong: http://localhost:3000/

**Solution:**
```bash
# Check Vite is running
lsof -i:3000

# Visit correct URL
open http://localhost:3000/app/
```

---

### Issue 7: LLM API Errors

**Error:**
```
Error calling LLM: Invalid API key
```

**Cause:** No LLM API keys configured

**Solution:**

1. **Add at least one LLM key to `backend/.env`:**
   ```bash
   # Choose one or more:
   ANTHROPIC_API_KEY=sk-ant-xxx
   OPENAI_API_KEY=sk-xxx
   GROQ_API_KEY=gsk_xxx
   ```

2. **Restart backend:**
   ```bash
   pnpm backend:dev
   ```

3. **Test:**
   ```bash
   curl -X POST http://localhost:3001/api/query \
     -H "Content-Type: application/json" \
     -d '{"query": "Hello"}'
   ```

**Note:** Some features work without LLM keys:
- ✅ Graph visualization
- ✅ GitHub integration
- ✅ File operations
- ❌ AI-powered queries
- ❌ Test generation
- ❌ Documentation generation

---

### Issue 8: Database Connection Errors

**Error:**
```
Error: connect ECONNREFUSED
```

**Cause:** Using DATABASE_URL but PostgreSQL not configured

**Solution:**

**Option 1:** Use in-memory storage (default)
- No database needed for development
- Graph data stored in memory

**Option 2:** Set up PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql

# Start service
brew services start postgresql

# Create database
createdb devtools

# Add to .env
DATABASE_URL=postgresql://localhost:5432/devtools

# Run migrations
psql $DATABASE_URL < backend/schema.sql
```

---

### Issue 9: CORS Errors

**Error:**
```
Access to fetch at 'http://localhost:3001/api/xxx' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Cause:** CORS not configured properly

**Solution:** Already configured ✅

```typescript
// backend/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
```

**If still getting errors:**
1. Check `FRONTEND_URL` in `.env`
2. Restart backend
3. Clear browser cache

---

### Issue 10: OAuth Callback Fails

**Error:** Redirected to `/app?error=invalid_state`

**Possible Causes:**

1. **Wrong redirect URI in GitHub OAuth app**
   - Should be: `http://localhost:3001/api/github/callback`

2. **Missing OAuth credentials**
   ```bash
   # Check backend/.env
   GITHUB_CLIENT_ID=xxx
   GITHUB_CLIENT_SECRET=xxx
   GITHUB_REDIRECT_URI=http://localhost:3001/api/github/callback
   ```

3. **Cookie issues**
   - Clear browser cookies
   - Try incognito mode

**Solution:**

1. Verify GitHub OAuth app settings
2. Check environment variables
3. Restart backend
4. Test OAuth flow

---

## 🛠️ Debugging Commands

### Check All Services

```bash
# Check ports
lsof -i:3000,3001,3002

# Should show:
# node - port 3000 (Frontend)
# node - port 3001 (Backend)
# node - port 3002 (MCP Server)
```

### Test Backend Health

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Test GitHub Auth

```bash
curl http://localhost:3001/api/github/me
# Should return user info if token is valid
```

### Test DevTools Endpoints

```bash
# Analytics
curl http://localhost:3001/api/devflow/analytics

# Should return automation metrics
```

### View Backend Logs

```bash
# Backend logs show in terminal where you ran `pnpm dev`
# Look for errors starting with:
# [0] for frontend logs
# [1] for backend logs
```

### Check Environment Variables

```bash
# View loaded env vars (backend)
cd backend
node -e "require('dotenv').config(); console.log(process.env.GITHUB_TOKEN)"

# Should print your token (or undefined if not set)
```

---

## 🔄 Common Fixes

### Complete Reset

```bash
# 1. Kill all processes
lsof -ti:3000,3001,3002 | xargs kill -9

# 2. Clean install
rm -rf node_modules pnpm-lock.yaml
rm -rf packages/web/node_modules
rm -rf backend/node_modules
pnpm install

# 3. Restart
pnpm dev
```

### Reset Database (if using PostgreSQL)

```bash
# Drop and recreate
dropdb devtools
createdb devtools
psql $DATABASE_URL < backend/schema.sql
```

### Clear Browser Cache

```bash
# Chrome/Edge
Cmd+Shift+Delete (Mac)
Ctrl+Shift+Delete (Windows)

# Or use incognito mode
Cmd+Shift+N (Mac)
Ctrl+Shift+N (Windows)
```

---

## 📊 Health Check Script

Create `scripts/health-check.sh`:

```bash
#!/bin/bash

echo "🏥 Health Check - DevTools AI Suite"
echo "─────────────────────────────────────"

# Check Frontend
echo -n "Frontend (port 3000): "
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Running"
else
    echo "❌ Not running"
fi

# Check Backend
echo -n "Backend (port 3001): "
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Running & Responding"
else
    echo "❌ Not responding"
fi

# Check MCP
echo -n "MCP Server (port 3002): "
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Running"
else
    echo "⚠️  Not running (optional)"
fi

# Check GitHub Auth
echo -n "GitHub Authentication: "
RESPONSE=$(curl -s http://localhost:3001/api/github/me)
if echo "$RESPONSE" | grep -q "authenticated.*true"; then
    echo "✅ Working"
else
    echo "❌ Not configured"
fi

echo "─────────────────────────────────────"
echo "Run 'pnpm dev' if services are not running"
```

**Usage:**
```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

---

## 🐛 Report Issues

If you encounter issues not covered here:

1. **Check logs:** Look for errors in terminal
2. **Search documentation:** Check CLAUDE.md and other docs
3. **GitHub Issues:** https://github.com/anthropics/claude-code/issues
4. **Include:**
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version)
   - Relevant config files

---

## ✅ Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Port in use | `lsof -ti:3000,3001,3002 \| xargs kill -9` |
| Can't connect | Check backend is running: `curl localhost:3001/health` |
| Auth not working | Check GITHUB_TOKEN in `.env`, restart backend |
| Frontend blank | Visit `http://localhost:3000/app/` (with /app/) |
| TypeScript errors | `rm -rf node_modules && pnpm install` |
| CORS errors | Check FRONTEND_URL in `.env` |
| Database errors | Use in-memory storage (no DATABASE_URL) |
| OAuth fails | Check GitHub OAuth app redirect URI |

---

**Most Common Solution:** Restart everything
```bash
lsof -ti:3000,3001,3002 | xargs kill -9
pnpm dev
```

🎯 **99% of issues are fixed by restarting!**
