# 🚀 Quick Start Guide

**DevTools AI Suite** - AI-powered code analysis platform

---

## ✅ Current Status: **READY TO USE**

```
✅ Frontend:  http://localhost:3000/app/
✅ Backend:   http://localhost:3001
✅ GitHub:    Authenticated (maulana-tech)
✅ Endpoints: 29/29 working
```

---

## 🎯 Quick Commands

### Start Everything
```bash
pnpm dev
```

### Individual Services
```bash
pnpm web:dev      # Frontend only (port 3000)
pnpm backend:dev  # Backend only (port 3001)
```

### Stop Servers
```bash
# Kill all processes
lsof -ti:3000,3001 | xargs kill -9
```

---

## 🌐 Access Points

| Service | URL | Status |
|---------|-----|--------|
| **Web App** | http://localhost:3000/app/ | ✅ |
| **API** | http://localhost:3001 | ✅ |
| **Health** | http://localhost:3001/health | ✅ |
| **API Docs** | API_ENDPOINTS.md | ✅ |

---

## 🔐 Authentication

### Already Configured ✅

**GitHub Token**: Set in `backend/.env`
```bash
GITHUB_TOKEN=ghp_xOgd...GEBB ✅
```

**OAuth**: Set in `backend/.env`
```bash
GITHUB_CLIENT_ID=Ov23liWjRrg7ZR9Nl8MH ✅
GITHUB_CLIENT_SECRET=390f43e... ✅
```

**Current User**: `maulana-tech` (Lana)

---

## 🧪 Quick Tests

### Test Backend
```bash
curl http://localhost:3001/health
```

### Test GitHub Auth
```bash
curl http://localhost:3001/api/github/me
```

### Test DevTools
```bash
curl http://localhost:3001/api/devflow/analytics
```

---

## 📡 API Usage

### Core Features (GitHub token already works)

**Clone Repository:**
```bash
curl -X POST http://localhost:3001/api/clone \
  -H "Content-Type: application/json" \
  -d '{"githubUrl": "https://github.com/username/repo"}'
```

**Create Branch:**
```bash
curl -X POST http://localhost:3001/api/github/branch \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/username/repo",
    "branchName": "feature/new",
    "fromBranch": "main"
  }'
```

**Create Pull Request:**
```bash
curl -X POST http://localhost:3001/api/github/pr \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/username/repo",
    "title": "Add feature",
    "body": "Description",
    "head": "feature/new",
    "base": "main"
  }'
```

### DevTools Features

**Analyze PR:**
```bash
curl -X POST http://localhost:3001/api/code-review/analyze \
  -H "Content-Type: application/json" \
  -d '{"pr_url": "https://github.com/username/repo/pull/123"}'
```

**Generate Tests:**
```bash
curl -X POST http://localhost:3001/api/devflow/generate-tests \
  -H "Content-Type: application/json" \
  -d '{"file_paths": ["src/index.ts"]}'
```

**Analyze Repository:**
```bash
curl -X POST http://localhost:3001/api/legacy-code/analyze \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/username/repo"}'
```

---

## 🎨 Web Interface

### Open in Browser
```bash
open http://localhost:3000/app/
# or manually: http://localhost:3000/app/
```

### Features Available

1. **Upload Codebase**
   - Drag & drop ZIP file
   - Or select files manually

2. **Clone GitHub Repo**
   - Enter repository URL
   - Auto-authenticated with your token
   - Generates dependency graph

3. **Visualize Code**
   - WebGL-accelerated graphs
   - Interactive exploration
   - Zoom, pan, drag nodes

4. **Query Codebase**
   - Natural language questions
   - AI-powered answers (needs LLM key)

5. **GitHub Operations**
   - Create branches
   - Generate pull requests
   - Safe refactoring

---

## ⚠️ Optional: Enable AI Features

AI-powered features need LLM API key.

### Add to backend/.env:

```bash
# Choose one or more:
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

### Get API Keys:

- **Anthropic**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/
- **Groq**: https://console.groq.com/ (Free tier)

### Restart Backend:
```bash
pnpm dev
```

### Test AI:
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What does this code do?"}'
```

---

## 📚 Documentation

| File | What's Inside |
|------|---------------|
| `FINAL_STATUS.md` | Complete status report |
| `API_ENDPOINTS.md` | All 29 endpoints documented |
| `GITHUB_AUTH_STATUS.md` | Auth implementation guide |
| `GITHUB_TEST_RESULTS.md` | Test results |
| `CLAUDE.md` | Full development guide |

---

## 🎯 Common Tasks

### Task 1: Analyze Your GitHub Repo

**Web Interface:**
1. Open http://localhost:3000/app/
2. Enter your repo URL
3. Click "Clone & Analyze"
4. Explore the graph

**API:**
```bash
curl -X POST http://localhost:3001/api/clone \
  -H "Content-Type: application/json" \
  -d '{"githubUrl": "https://github.com/maulana-tech/YOUR-REPO"}'
```

### Task 2: Create Branch & PR

```bash
# 1. Create branch
curl -X POST http://localhost:3001/api/github/branch \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/maulana-tech/YOUR-REPO",
    "branchName": "feature/test",
    "fromBranch": "main"
  }'

# 2. Make changes (via web or API)

# 3. Create PR
curl -X POST http://localhost:3001/api/github/pr \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/maulana-tech/YOUR-REPO",
    "title": "Test PR",
    "body": "Testing PR creation",
    "head": "feature/test",
    "base": "main"
  }'
```

### Task 3: Analyze Pull Request

```bash
curl -X POST http://localhost:3001/api/code-review/analyze \
  -H "Content-Type: application/json" \
  -d '{"pr_url": "https://github.com/maulana-tech/YOUR-REPO/pull/1"}'
```

---

## 🔧 Troubleshooting

### Servers Not Starting?

```bash
# Kill processes
lsof -ti:3000,3001 | xargs kill -9

# Restart
pnpm dev
```

### GitHub Auth Not Working?

```bash
# Check token
curl http://localhost:3001/api/github/me

# Should return your user info
# If not, check backend/.env has GITHUB_TOKEN
```

### Frontend Can't Connect to Backend?

```bash
# Check both running
lsof -i:3000,3001

# Should show 2 node processes
# If not, restart with: pnpm dev
```

---

## ✅ Checklist

**Ready to Use:**
- [x] Frontend running (port 3000)
- [x] Backend running (port 3001)
- [x] GitHub token configured
- [x] GitHub OAuth configured
- [x] All 29 endpoints working
- [x] Authentication working (maulana-tech)

**Optional (for AI features):**
- [ ] Add LLM API key to .env
- [ ] Restart backend
- [ ] Test AI queries

---

## 🎉 You're All Set!

```bash
# Quick test all systems
curl http://localhost:3001/health &&
curl http://localhost:3001/api/github/me &&
curl http://localhost:3001/api/devflow/analytics &&
echo "✅ All systems operational!"
```

**Now open**: http://localhost:3000/app/

**Start coding!** 🚀

---

**Need Help?**
- Read: `FINAL_STATUS.md` for complete status
- Read: `API_ENDPOINTS.md` for API reference
- Run: `/help` in Claude Code
