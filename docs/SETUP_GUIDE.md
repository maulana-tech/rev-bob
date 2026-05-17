# DevTools AI Suite - Setup & Running Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn
- Git

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd packages/web
npm install
```

### 3. Configure Environment Variables

Create `.env` file in the root directory:

```bash
# IBM Bob Configuration
IBM_BOB_API_KEY=your_ibm_bob_api_key_here
IBM_BOB_API_URL=https://api.ibm.com/bob/v1

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token

# Database
DATABASE_URL=sqlite:///./devtools.db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Initialize Database

```bash
cd backend
python -c "from models.database import init_db; init_db()"
```

### 5. Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 6. Start Frontend Development Server

```bash
cd packages/web
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## 📁 Project Structure

```
devtools-ai-suite/
├── backend/                    # FastAPI Backend
│   ├── agents/                # AI Agents
│   │   ├── orchestrator.py   # Main coordinator
│   │   ├── code_review/      # CodeReview agents (4 files)
│   │   ├── devflow/          # DevFlow agents (6 files)
│   │   └── legacy_code/      # LegacyCode agents (7 files)
│   ├── api/                  # API Endpoints
│   │   ├── code_review.py
│   │   ├── devflow.py
│   │   └── legacy_code.py
│   ├── services/             # Core Services
│   │   ├── bob_client.py     # IBM Bob integration
│   │   └── github_client.py  # GitHub API client
│   ├── models/               # Database Models
│   │   ├── database.py
│   │   ├── analysis.py
│   │   └── knowledge_graph.py
│   └── main.py               # FastAPI app entry
│
├── packages/web/              # Next.js Frontend
│   ├── app/                  # App Router
│   │   ├── page.tsx          # Home dashboard
│   │   ├── code-review/      # CodeReview feature
│   │   ├── devflow/          # DevFlow feature
│   │   └── legacy-code/      # LegacyCode feature
│   ├── components/           # React Components
│   │   └── Header.tsx
│   └── lib/                  # Utilities
│       └── api.ts            # API client
│
└── docs/                      # Documentation
    ├── CONTEXT.md
    ├── AGENTS.md
    ├── IMPLEMENTATION_PLAN.md
    └── IBM_BOB_REPORT.md
```

---

## 🎯 Features & Usage

### 1. 🥇 CodeReview Copilot

**Purpose**: AI-powered PR reviewer with full repository context

**How to Use**:
1. Navigate to http://localhost:3000/code-review
2. Enter GitHub PR URL (e.g., `https://github.com/owner/repo/pull/123`)
3. Click "Analyze PR"
4. View results:
   - Critical/Warning/Info issues
   - Impact graph visualization
   - GitHub-ready review comment

**Backend Endpoint**: `POST /api/code-review/analyze`

**Example Request**:
```bash
curl -X POST http://localhost:8000/api/code-review/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pr_url": "https://github.com/owner/repo/pull/123",
    "include_full_context": true
  }'
```

---

### 2. 🥈 DevFlow Automator

**Purpose**: Automate repetitive development tasks

**How to Use**:
1. Navigate to http://localhost:3000/devflow
2. Enter local repository path
3. Select tasks:
   - 🧪 Generate Unit Tests
   - 📝 Update Documentation
   - 📋 Generate Changelog
4. Click "Run Automation"
5. View time saved and results

**Backend Endpoint**: `POST /api/devflow/run`

**Example Request**:
```bash
curl -X POST http://localhost:8000/api/devflow/run \
  -H "Content-Type: application/json" \
  -d '{
    "repo_path": "/path/to/repo",
    "tasks": ["tests", "docs", "changelog"]
  }'
```

---

### 3. 🥉 LegacyCode Explainer

**Purpose**: Interactive knowledge graphs for legacy code comprehension

**How to Use**:
1. Navigate to http://localhost:3000/legacy-code
2. Enter GitHub repository URL
3. Click "Index Repository"
4. Explore:
   - 🕸️ Knowledge Graph (interactive visualization)
   - 💬 Chat (ask questions about codebase)
   - 📚 Wiki (auto-generated documentation)
   - ⚠️ Danger Zones (quality issues)

**Backend Endpoints**:
- `POST /api/legacy-code/index` - Index repository
- `POST /api/legacy-code/chat` - Chat with codebase
- `GET /api/legacy-code/wiki/{index_id}` - Generate wiki
- `GET /api/legacy-code/danger-zones/{index_id}` - Get danger zones

**Example Request**:
```bash
curl -X POST http://localhost:8000/api/legacy-code/index \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/owner/repository"
  }'
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd packages/web
npm test
```

### Integration Tests

```bash
# Start both backend and frontend
# Then run integration tests
npm run test:integration
```

---

## 🔧 Development

### Backend Development

```bash
# Auto-reload on changes
cd backend
python -m uvicorn main:app --reload

# Check API docs
open http://localhost:8000/docs
```

### Frontend Development

```bash
# Auto-reload on changes
cd packages/web
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📊 API Documentation

### Health Check
```
GET /health
```

### CodeReview Endpoints
```
POST /api/code-review/analyze
GET  /api/code-review/analysis/{analysis_id}
```

### DevFlow Endpoints
```
POST /api/devflow/run
GET  /api/devflow/analytics
```

### LegacyCode Endpoints
```
POST /api/legacy-code/index
GET  /api/legacy-code/graph/{index_id}
POST /api/legacy-code/chat
GET  /api/legacy-code/wiki/{index_id}
GET  /api/legacy-code/danger-zones/{index_id}
```

Full API documentation available at: http://localhost:8000/docs

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
cd backend
pip install -r requirements.txt
```

**Issue**: `IBM Bob API authentication failed`
- Check your `IBM_BOB_API_KEY` in `.env`
- Verify API key is valid and active

**Issue**: `GitHub API rate limit exceeded`
- Add `GITHUB_TOKEN` to `.env`
- Use authenticated requests for higher rate limits

### Frontend Issues

**Issue**: `Cannot find module 'next'`
```bash
cd packages/web
npm install
```

**Issue**: `API connection refused`
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env`

**Issue**: TypeScript errors
```bash
cd packages/web
npm install --save-dev @types/node @types/react
```

---

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. Create `Procfile`:
```
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

2. Set environment variables in platform dashboard

3. Deploy:
```bash
git push railway main
# or
git push render main
```

### Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel

2. Configure build settings:
   - Build Command: `cd packages/web && npm run build`
   - Output Directory: `packages/web/.next`

3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL

4. Deploy automatically on push to main

---

## 📝 IBM Bob Session Export

For hackathon submission, export IBM Bob session logs:

```bash
cd backend
python -c "from services.bob_client import export_session_logs; export_session_logs()"
```

This creates `IBM_BOB_REPORT.md` with all session details.

---

## 🎥 Demo Video

Record a 2-minute demo showing:
1. CodeReview analyzing a real PR
2. DevFlow automating test generation
3. LegacyCode building knowledge graph
4. IBM Bob integration in action

---

## 📚 Additional Resources

- [CONTEXT.md](./CONTEXT.md) - Project overview
- [AGENTS.md](./AGENTS.md) - Multi-agent architecture
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Development timeline
- [IBM_BOB_REPORT.md](./IBM_BOB_REPORT.md) - IBM Bob usage report

---

## 🏆 Hackathon Submission Checklist

- [ ] All features working
- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] IBM Bob session logs exported
- [ ] Demo video recorded (2 minutes)
- [ ] README updated with live demo URL
- [ ] GitHub repository public
- [ ] All documentation complete

---

## 📧 Support

For issues or questions:
- Open GitHub issue
- Check documentation in `/docs`
- Review API docs at `/docs` endpoint

---

**Built for IBM Bob Hackathon 2026**  
**Multi-agent architecture with full repository context analysis**