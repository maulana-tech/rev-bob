# DevTools AI Suite

> Interactive Structural Code Intelligence & Safe Refactor Simulation  
> Powered by Multi-LLM Orchestration (Claude, GPT, Groq, Cerebras, Gemini)

[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express)](https://expressjs.com/)
[![Sigma.js](https://img.shields.io/badge/Sigma.js-3.0-FF6600?style=flat)](https://www.sigmajs.org/)

## 🎯 Overview

DevTools AI Suite is a powerful code analysis platform that provides:
- **Interactive Graph Visualization** - WebGL-accelerated dependency graphs with ForceAtlas2 physics
- **Multi-Agent Analysis** - Security, architecture, performance, quality, and onboarding insights
- **Safe Refactor Simulation** - Impact analysis before making changes
- **Multi-LLM Support** - Claude, GPT, Groq, Cerebras, and Gemini with automatic fallback

Built from [CDE-APP](https://github.com/anthropics/cde-app) with enhanced features and production-ready architecture.

## ✨ Features

### 🎨 Advanced Visualization
- **WebGL Graph Rendering** - Hardware-accelerated with Sigma.js (60fps with 1000+ nodes)
- **ForceAtlas2 Layout** - Physics-based graph layout for organic clustering
- **Type-Based Encoding** - Different colors for files, functions, classes, methods
- **Blast Radius Analysis** - Visual impact propagation for code changes
- **Interactive Exploration** - Drag, zoom, pan, and filter nodes

### 🤖 Multi-LLM Orchestration
- **5+ LLM Providers** - Anthropic Claude, OpenAI GPT, Groq, Cerebras, Google Gemini
- **Automatic Fallback** - If one provider fails, automatically tries the next
- **Custom LLMs** - Support for custom endpoints with OpenAI-compatible APIs
- **Cost Optimization** - Intelligent routing based on task complexity

### 🔍 Code Analysis
- **Dependency Graphs** - Visualize imports, calls, and relationships
- **Complexity Metrics** - Measure code complexity and maintainability
- **Impact Analysis** - See what changes before you make them
- **Security Review** - AI-powered security vulnerability detection
- **Architecture Review** - Structural quality assessment

### 🚀 Developer Tools
- **GitHub Integration** - Fetch repos, create PRs, and branches
- **File Upload** - Drag-and-drop ZIP files up to 500MB
- **Code Inspector** - Syntax-highlighted code viewer
- **Process Visualization** - Mermaid diagrams for workflows
- **Report Generation** - Comprehensive analysis reports

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  GraphView2D │  │ Multi-Agent  │  │ Code Inspector  │  │
│  │  (Sigma.js)  │  │   Analysis   │  │  (Highlighted)  │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express + TypeScript)             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Graph Builder│  │   GitHub     │  │   Multi-LLM     │  │
│  │   (Babel)    │  │  Integration │  │  Orchestrator   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      LLM Providers                          │
│   Claude  •  GPT-4  •  Groq  •  Cerebras  •  Gemini       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with pnpm)
- At least one LLM API key (Anthropic, OpenAI, Groq, Cerebras, or Gemini)
- Optional: GitHub token for repo analysis

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/devtools-ai-suite.git
cd devtools-ai-suite

# 2. Install dependencies
pnpm install

# 3. Configure environment
cd backend
cp .env.example .env
# Edit .env with your API keys

# 4. Start development
cd ..
pnpm dev
```

### That's it! 🎉

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📦 Project Structure

```
devtools-ai-suite/
├── packages/
│   └── web/                      # Vite + React frontend
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/       # React components
│       │   │   ├── GraphView2D.tsx
│       │   │   ├── MetricsDashboard.tsx
│       │   │   ├── CodeInspector.tsx
│       │   │   └── ...
│       │   ├── lib/              # Utilities
│       │   └── types/            # TypeScript types
│       ├── vite.config.ts
│       └── package.json
│
└── backend/                       # Express + TypeScript server
    ├── index.ts                   # Main server
    ├── github.ts                  # GitHub integration
    ├── graph-builder.ts           # Graph construction
    ├── parser.ts                  # Code parsing
    ├── mcp-server.ts              # Model Context Protocol
    ├── package.json
    └── tsconfig.json
```

## 🛠️ Development

### Commands

```bash
# Start both frontend and backend
pnpm dev

# Start individually
pnpm web:dev        # Frontend only
pnpm backend:dev    # Backend only

# Build for production
pnpm build

# Clean everything
pnpm clean
```

### Environment Variables

Create `backend/.env`:

```bash
# Server
PORT=3001
NODE_ENV=development

# At least one LLM API key required
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=csk-...
GOOGLE_API_KEY=AIza...

# Optional: GitHub integration
GITHUB_TOKEN=ghp_...

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

### Graph Operations

```typescript
// Upload codebase
POST /upload
Body: FormData with files

// Fetch from GitHub
POST /github
Body: { url: "https://github.com/owner/repo" }

// Get dependency graph
GET /graph
Response: { nodes: [...], edges: [...] }
```

### Analysis

```typescript
// Natural language query
POST /query
Body: { query: "What does this code do?" }

// Multi-agent analysis
POST /agents
Response: {
  security: { title, icon, content },
  architecture: { title, icon, content },
  performance: { title, icon, content },
  quality: { title, icon, content },
  onboarding: { title, icon, content }
}

// Generate report
POST /report
Response: { stats, mermaid, markdown }
```

### GitHub Integration

```typescript
// Create pull request
POST /github/pr
Body: { owner, repo, title, body, head, base }

// Create branch
POST /github/branch
Body: { owner, repo, branch, sha }
```

## 🎨 Tech Stack

### Frontend
- **Vite 5.2** - Lightning-fast dev server with HMR
- **React 18.3** - Modern UI library
- **TypeScript 5.4** - Type-safe development
- **Sigma.js 3.0** - WebGL graph rendering
- **D3.js 7.9** - Data visualization
- **Three.js 0.169** - 3D graphics
- **GSAP 3.14** - Smooth animations

### Backend
- **Express 4.18** - Fast web framework
- **TypeScript 5.4** - Type safety
- **Anthropic SDK** - Claude integration
- **OpenAI SDK** - GPT integration
- **Babel Parser** - Code analysis
- **Graphology** - Graph data structures

## 📊 Performance

- **HMR**: < 50ms (Vite)
- **Graph Rendering**: 1000+ nodes at 60fps (WebGL)
- **API Response**: < 100ms (cached)
- **Build Time**: ~15s (production)
- **Bundle Size**: ~2MB (gzipped)

## 🧪 Testing

```bash
# Frontend tests
cd packages/web
pnpm test

# Backend tests
cd backend
pnpm test

# Integration tests
pnpm test:e2e
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd packages/web
vercel deploy --prod
```

### Backend (Railway/Render)
```bash
cd backend
railway up
# or
render deploy
```

### Environment Variables for Production
- Set all LLM API keys
- Configure FRONTEND_URL to production domain
- Enable CORS for production domains

## 📖 Documentation

All documentation has been organized in the [`docs/`](./docs/) directory:

### 📋 Setup & Getting Started
- **[QUICK_START.md](./docs/QUICK_START.md)** - Quick start guide
- **[SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)** - Detailed setup instructions
- **[SETUP_COMPLETE.md](./docs/SETUP_COMPLETE.md)** - Setup completion checklist
- **[DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md)** - Development workflow

### 🏗️ Architecture & Implementation
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Project organization
- **[IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)** - Implementation roadmap
- **[FEATURE_COMPARISON.md](./docs/FEATURE_COMPARISON.md)** - Feature comparison
- **[FEATURES_IMPLEMENTED.md](./docs/FEATURES_IMPLEMENTED.md)** - Implemented features

### 🔧 Integration & APIs
- **[API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)** - API documentation
- **[CDE_INTEGRATION.md](./docs/CDE_INTEGRATION.md)** - CDE integration guide
- **[GITHUB_AUTH_STATUS.md](./docs/GITHUB_AUTH_STATUS.md)** - GitHub authentication
- **[GITHUB_TEST_RESULTS.md](./docs/GITHUB_TEST_RESULTS.md)** - GitHub test results
- **[JIRA_INTEGRATION.md](./docs/JIRA_INTEGRATION.md)** - Jira integration guide
- **[WATSONX_INTEGRATION.md](./docs/WATSONX_INTEGRATION.md)** - IBM Watsonx.ai integration
- **[WATSONX_ORCHESTRATE_SETUP.md](./docs/WATSONX_ORCHESTRATE_SETUP.md)** - Watsonx Orchestrate setup

### 🤖 AI Agents & Analysis
- **[AGENTS.md](./docs/AGENTS.md)** - AI agents overview
- **[AGENT_DEMO_GUIDE.md](./docs/AGENT_DEMO_GUIDE.md)** - Agent demo guide
- **[AGENT_KNOWLEDGE.md](./docs/AGENT_KNOWLEDGE.md)** - Agent knowledge base
- **[GITNEXUS_ANALYSIS.md](./docs/GITNEXUS_ANALYSIS.md)** - GitNexus analysis

### 🚀 Deployment & Operations
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[DEPLOYMENT_PLAN.md](./docs/DEPLOYMENT_PLAN.md)** - Deployment planning
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Troubleshooting guide

### 📊 Status & Reports
- **[STATUS.md](./docs/STATUS.md)** - Current project status
- **[FINAL_STATUS.md](./docs/FINAL_STATUS.md)** - Final status report
- **[IBM_BOB_REPORT.md](./docs/IBM_BOB_REPORT.md)** - IBM Bob integration report
- **[MIGRATION_COMPLETE.md](./docs/MIGRATION_COMPLETE.md)** - Migration completion
- **[CDE_APP_MIGRATION_COMPLETE.md](./docs/CDE_APP_MIGRATION_COMPLETE.md)** - CDE app migration

### 🔍 Context & Analysis
- **[CONTEXT.md](./docs/CONTEXT.md)** - Project context
- **[CLAUDE.md](./docs/CLAUDE.md)** - Claude AI integration
- **[HACKATHON_ALIGNMENT.md](./docs/HACKATHON_ALIGNMENT.md)** - Hackathon alignment

### 🛠️ Quick Fixes & Utilities
- **[QUICK_FIX.md](./docs/QUICK_FIX.md)** - Quick fixes and solutions

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built from [CDE-APP](https://github.com/anthropics/cde-app) by Anthropic
- Inspired by GitNexus and modern code analysis tools
- Powered by Claude, GPT, Groq, Cerebras, and Gemini

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/devtools-ai-suite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/devtools-ai-suite/discussions)

---

**Built with ❤️ for developers who love beautiful code**

🚀 **[Get Started Now](#quick-start)** | 📚 **[Read the Docs](./CLAUDE.md)** | 🐛 **[Report a Bug](https://github.com/yourusername/devtools-ai-suite/issues)**
