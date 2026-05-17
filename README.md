# Rev BOB - Structural Refactor Engine

> AI-Powered Code Intelligence & Visual Impact Analysis  
> Powered by IBM Watson AI & NVIDIA AI | Built for IBM BOB Hackathon 2025

[![IBM Watson](https://img.shields.io/badge/IBM_Watson-AI-0F62FE?style=flat&logo=ibm)](https://www.ibm.com/watson)
[![NVIDIA](https://img.shields.io/badge/NVIDIA-AI-76B900?style=flat&logo=nvidia)](https://www.nvidia.com/en-us/ai/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## 🎯 Overview

**Rev BOB** is an **AI-powered integration platform** that bridges the gap between code intelligence and enterprise workflows. Built for the **IBM BOB Hackathon 2025**, Rev BOB seamlessly connects:

### 🔗 Core Integrations

<table>
<tr>
<td width="50%">

**🤖 AI/LLM Integration**
- **IBM Watson AI** - Enterprise NLP & code understanding
- **NVIDIA AI** - High-performance inference
- **Intelligent Routing** - Automatic fallback & load balancing
- **Custom Prompts** - Optimized for code analysis

</td>
<td width="50%">

**📋 Project Management**
- **Jira Integration** - Create issues from analysis
- **Auto-ticket Generation** - Convert findings to tasks
- **Project Mapping** - Link code to business requirements
- **Issue Type Detection** - Smart categorization

</td>
</tr>
<tr>
<td width="50%">

**💻 Version Control**
- **GitHub Integration** - Clone, analyze, PR creation
- **Branch Management** - Create feature branches
- **File Operations** - Read/write repository files
- **PR Automation** - Generate PRs from refactoring plans

</td>
<td width="50%">

**🏢 IBM BOB Ecosystem**
- **IBM Watsonx.ai** - Enterprise AI orchestration
- **IBM Watsonx Orchestrate** - Workflow automation
- **IBM Cloud** - Native cloud integration
- **BOB Framework** - Built on IBM BOB principles

</td>
</tr>
</table>

### 💡 The Rev BOB Advantage

Rev BOB transforms code analysis into actionable workflows by **automatically connecting** what the AI discovers with the tools your team already uses—no manual copying, no context switching, just seamless automation from insight to implementation.

## 🎯 Use Cases

### For Software Architects
- **📐 Architecture Review** - Visualize system structure and identify architectural smells
- **🔄 Refactoring Planning** - Analyze impact before making structural changes
- **📊 Technical Debt** - Quantify complexity and identify improvement areas

### For Development Teams
- **🚀 Onboarding** - Help new developers understand codebases faster
- **🔍 Code Understanding** - Ask questions in natural language, get accurate answers
- **🐛 Bug Investigation** - Trace execution flows to find root causes

### For Engineering Leaders
- **📈 Team Productivity** - Reduce time spent understanding legacy code
- **⚡ Decision Making** - Data-driven insights for architectural decisions
- **🔐 Security & Compliance** - AI-powered security audits and vulnerability detection

## ✨ Key Features

### 🔍 Intelligent Code Visualization
- **WebGL-Accelerated Graphs** - Render 1000+ nodes at 60fps with hardware acceleration
- **Physics-Based Layout** - ForceAtlas2 algorithm creates organic, intuitive code clusters
- **Smart Type Encoding** - Visual distinction between files, functions, classes, and methods
- **Blast Radius Analysis** - See exactly what code will be affected by your changes
- **Interactive Exploration** - Drag, zoom, filter, and explore your entire codebase visually

### 🤖 AI-Powered Intelligence

**IBM Watson Integration**
- **Enterprise-Grade AI** - Production-ready analysis with IBM's trusted AI platform
- **Deep Code Understanding** - Semantic analysis of code structure and relationships
- **Business Process Discovery** - Automatically map business workflows from code
- **Security & Compliance** - AI-driven vulnerability detection and best practices

**NVIDIA AI Integration**
- **High-Performance Inference** - Fast, scalable AI processing for large codebases
- **Process Detection** - Identify execution flows and critical paths
- **Natural Language Queries** - Ask questions about your code in plain English
- **Automatic Fallback** - Intelligent routing ensures high availability

### 📊 Enterprise Analysis
- **Automated Process Detection** - Discover hidden workflows and execution chains
- **Impact Assessment** - Measure change propagation across your codebase
- **Complexity Metrics** - Quantify technical debt and maintainability
- **Architecture Review** - AI-powered structural quality assessment
- **Security Audit** - Identify vulnerabilities and security risks

### 🔗 Seamless Integration
- **GitHub Integration** - Clone repos, create PRs, and manage branches
- **Jira Integration** - Create issues directly from code analysis
- **IBM Watsonx.ai** - Connect to enterprise AI workflows
- **Drag & Drop Upload** - Analyze ZIP files up to 500MB instantly
- **RESTful API** - Integrate Rev BOB into your CI/CD pipeline

## 🏗️ Architecture

Rev BOB follows a modern, scalable architecture designed for enterprise deployments:

```
┌────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Graph View │  │   Ask AI     │  │  Process Detection   │ │
│  │ (Sigma.js)  │  │  (Natural    │  │  (Auto Workflow      │ │
│  │  WebGL      │  │   Language)  │  │   Discovery)         │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │Code         │  │   GitHub     │  │  Jira Integration    │ │
│  │Inspector    │  │  Integration │  │                      │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              ↓ RESTful API
┌────────────────────────────────────────────────────────────────┐
│              Backend (Express.js + TypeScript)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │Graph Builder│  │  GitHub API  │  │   Jira API           │ │
│  │(Babel AST)  │  │  Integration │  │   Integration        │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            AI Orchestration Layer                       │  │
│  │  • Intelligent routing & fallback                       │  │
│  │  • JSON extraction & validation                         │  │
│  │  • Response caching & optimization                      │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                      AI Provider Layer                         │
│  ┌──────────────────────┐    ┌─────────────────────────────┐  │
│  │   IBM Watson AI      │    │      NVIDIA AI              │  │
│  │   • Enterprise AI    │    │   • High Performance        │  │
│  │   • Watsonx.ai       │    │   • Low Latency             │  │
│  │   • Security Focused │    │   • Scalable                │  │
│  └──────────────────────┘    └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Core Components

1. **Frontend Layer** - React-based SPA with real-time graph visualization
2. **API Layer** - Express.js REST API with TypeScript type safety
3. **Analysis Engine** - Babel-based AST parsing and graph construction
4. **AI Orchestration** - Intelligent routing between IBM Watson and NVIDIA AI
5. **Integration Layer** - GitHub, Jira, and IBM Watsonx.ai connectors

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** with pnpm package manager
- **IBM Watson API Key** (from IBM Cloud)
- **NVIDIA AI API Key** (from NVIDIA AI)
- **Optional**: GitHub token for repository analysis
- **Optional**: Jira credentials for issue integration

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/rev-bob.git
cd rev-bob

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cd backend
cp .env.example .env

# Edit .env with your API keys:
# - IBM_WATSON_API_KEY=your_watson_key
# - NVIDIA_API_KEY=your_nvidia_key
# - GITHUB_TOKEN=your_github_token (optional)
# - JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN (optional)

# 4. Start the application
cd ..
pnpm dev
```

### That's it! 🎉

Your Rev BOB instance is now running:

- **🌐 Frontend**: http://localhost:3000
- **⚡ Backend API**: http://localhost:3001
- **💚 Health Check**: http://localhost:3001/health

### First Steps

1. **Upload a codebase** - Drag and drop a ZIP file or clone from GitHub
2. **Explore the graph** - Visualize dependencies and relationships
3. **Ask questions** - Use natural language to query your codebase
4. **Detect processes** - Discover business workflows automatically
5. **Analyze impact** - See the blast radius of potential changes

## 📦 Project Structure

```
rev-bob/
├── packages/
│   └── web/                       # Frontend Application
│       ├── src/
│       │   ├── App.tsx            # Main app component
│       │   ├── components/        # React components
│       │   │   ├── GraphView2D.tsx        # Graph visualization
│       │   │   ├── AskAI.tsx              # Natural language queries
│       │   │   ├── ProcessDetection.tsx   # Workflow discovery
│       │   │   ├── CodeInspector.tsx      # Code viewer
│       │   │   ├── GithubIntegration.tsx  # GitHub features
│       │   │   └── JiraIntegration.tsx    # Jira features
│       │   ├── lib/
│       │   │   ├── api.ts         # API client
│       │   │   └── graph.ts       # Graph utilities
│       │   └── types/
│       │       └── graph.ts       # TypeScript definitions
│       ├── vite.config.ts
│       └── package.json
│
└── backend/                        # Backend API Server
    ├── index.ts                    # Main server & routes
    ├── github.ts                   # GitHub API integration
    ├── graph-builder.ts            # AST parsing & graph construction
    ├── parser.ts                   # Code analysis engine
    ├── mcp-server.ts               # Model Context Protocol server
    ├── .env.example                # Environment template
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

Create `backend/.env` with the following configuration:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# IBM Watson AI (Required)
IBM_WATSON_API_KEY=your_watson_api_key_here
IBM_WATSON_URL=https://api.watsonx.ai/...  # Your Watson instance URL

# NVIDIA AI (Required)
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# GitHub Integration (Optional)
GITHUB_TOKEN=ghp_your_github_token_here

# Jira Integration (Optional)
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_jira_api_token_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# IBM Watsonx Orchestrate (Optional)
WATSONX_ORCHESTRATE_URL=https://your-instance.watsonorchestrate.ibm.com
WATSONX_ORCHESTRATE_API_KEY=your_orchestrate_api_key_here
```

> **Note**: You need at least one AI provider (IBM Watson or NVIDIA AI) configured for Rev BOB to function.

## 📚 API Documentation

### Core Endpoints

#### Upload & Parse Codebase
```typescript
POST /api/upload
Content-Type: multipart/form-data
Body: { file: <zip-file> }
Response: { nodes: [...], edges: [...] }
```

#### Clone from GitHub
```typescript
POST /api/clone
Body: { githubUrl: "https://github.com/owner/repo" }
Response: { nodes: [...], edges: [...] }
```

### AI-Powered Analysis

#### Ask AI (Natural Language Query)
```typescript
POST /api/query
Body: { 
  question: "How does authentication work?",
  graphData: { nodes: [...], edges: [...] },
  llmConfig?: { provider: "watson" | "nvidia" }
}
Response: {
  explanation: "CALL CHAIN:\nauth.ts -> validateToken() -> ...",
  relevantNodes: ["auth.ts", "validateToken"],
  provider: "IBM Watson"
}
```

#### Process Detection (Auto-discover workflows)
```typescript
POST /api/processes
Body: { 
  graphData: { nodes: [...], edges: [...] },
  focusNode?: "specific-node-label"
}
Response: {
  processes: [{
    name: "User Authentication Flow",
    steps: 5,
    entryPoint: "login.ts",
    explanation: "Handles user login...",
    mermaid: "graph TD\n A[login] --> B[validate]..."
  }]
}
```

#### Multi-Agent Analysis
```typescript
POST /api/agent-analysis
Body: { graphData: { nodes: [...], edges: [...] } }
Response: {
  agents: {
    security: { title, icon, content },
    architecture: { title, icon, content },
    performance: { title, icon, content },
    quality: { title, icon, content },
    onboarding: { title, icon, content }
  },
  generatedAt: "2025-05-17T12:00:00Z"
}
```

### GitHub Integration

```typescript
// List repository files
POST /api/github/files
Body: { githubUrl, path?, token? }

// Create branch
POST /api/github/branch
Body: { owner, repo, branchName, baseBranch, token? }

// Create pull request
POST /api/github/pr
Body: { owner, repo, title, body, head, base, token? }
```

### Jira Integration

```typescript
// Get Jira status
GET /api/jira/status

// List projects
GET /api/jira/projects

// Create issue
POST /api/jira/issue
Body: {
  project: "PROJ",
  summary: "Issue title",
  description: "Description",
  issuetype: "Task",
  priority: "Medium"
}
```

## 🎨 Tech Stack

### Frontend Technologies
- **⚡ Vite 5.2** - Lightning-fast dev server with HMR
- **⚛️ React 18.3** - Modern component-based UI
- **📘 TypeScript 5.4** - Type-safe development
- **📊 Sigma.js 3.0** - WebGL-accelerated graph rendering
- **🎨 Tailwind CSS** - Utility-first styling
- **🔄 React Query** - Data fetching and caching

### Backend Technologies
- **🚀 Express.js 4.18** - Fast, unopinionated web framework
- **📘 TypeScript 5.4** - Full type safety
- **🔍 Babel Parser** - JavaScript/TypeScript AST parsing
- **📊 Graphology** - Graph data structures and algorithms
- **🔗 Octokit** - GitHub API integration
- **📝 Atlassian Jira API** - Issue tracking integration

### AI & Machine Learning
- **🤖 IBM Watson AI** - Enterprise-grade natural language understanding
- **⚡ NVIDIA AI** - High-performance inference and processing
- **🧠 Custom AI Orchestration** - Intelligent routing and fallback logic
- **📦 Robust JSON Extraction** - Advanced LLM response parsing

### Infrastructure
- **☁️ Vercel** - Frontend hosting with edge functions
- **🚂 Railway** - Backend API deployment
- **🔐 CORS** - Secure cross-origin resource sharing
- **📡 RESTful API** - Standard HTTP endpoints

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

Rev BOB is production-ready and deployed at:
- **Frontend**: https://rev-bob.vercel.app (Vercel)
- **Backend**: https://devtoolsbackend-production.up.railway.app (Railway)

### Deploy Your Own Instance

#### Frontend (Vercel)
```bash
# Deploy to Vercel
cd packages/web
vercel deploy --prod

# Or use Vercel CLI with auto-detection
vercel --prod
```

#### Backend (Railway)
```bash
# Deploy to Railway
cd backend
railway up

# Or link to existing project
railway link
railway up
```

#### Backend (Alternative - Render)
```bash
# Deploy to Render
cd backend
render deploy
```

### Production Environment Variables

Ensure these are configured in your production environment:

```bash
# Required - AI Providers
IBM_WATSON_API_KEY=your_production_watson_key
NVIDIA_API_KEY=your_production_nvidia_key

# Required - CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Optional - Integrations
GITHUB_TOKEN=your_github_token
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_jira_token

# Optional - IBM Watsonx
WATSONX_ORCHESTRATE_URL=https://your-instance.watsonorchestrate.ibm.com
WATSONX_ORCHESTRATE_API_KEY=your_orchestrate_key
```

### CI/CD

Rev BOB supports automatic deployments:
- **Frontend**: Auto-deploys on push to `main` via Vercel
- **Backend**: Auto-deploys on push to `main` via Railway
- **Health Checks**: `/health` endpoint monitors backend status

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

## 🏆 IBM BOB Hackathon 2025

Rev BOB was specifically designed and built for the **IBM BOB Hackathon 2025** to demonstrate:

- **Enterprise AI Integration** - Seamless integration with IBM Watson and NVIDIA AI
- **Intelligent Code Analysis** - AI-powered process detection and impact analysis
- **Developer Productivity** - Visual tools that make complex codebases understandable
- **Scalable Architecture** - Production-ready design for enterprise deployments

### Hackathon Highlights

✅ **IBM Watson Integration** - Deep code understanding with enterprise AI  
✅ **NVIDIA AI Performance** - High-speed inference for large codebases  
✅ **Visual Intelligence** - Interactive dependency graphs with blast radius analysis  
✅ **Process Discovery** - Automatic business workflow detection from code  
✅ **Enterprise Ready** - GitHub, Jira, and Watsonx.ai integrations  

## 🙏 Acknowledgments

- **IBM Watson AI** - For providing enterprise-grade AI capabilities
- **NVIDIA AI** - For high-performance AI infrastructure
- Inspired by modern code intelligence tools and static analysis platforms
- Built with ❤️ for developers who want to understand code visually

## 📧 Support & Contact

- **🐛 Report Issues**: [GitHub Issues](https://github.com/yourusername/rev-bob/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/yourusername/rev-bob/discussions)
- **📖 Documentation**: See [docs/](./docs/) folder for detailed guides
- **🏆 Hackathon**: IBM BOB Hackathon 2025

## 🌟 Live Demo

- **🌐 Production**: [https://rev-bob.vercel.app](https://rev-bob.vercel.app)
- **⚡ API Backend**: [https://devtoolsbackend-production.up.railway.app](https://devtoolsbackend-production.up.railway.app)
- **💚 Health Check**: [https://devtoolsbackend-production.up.railway.app/health](https://devtoolsbackend-production.up.railway.app/health)

---

<div align="center">

**🚀 Built for IBM BOB Hackathon 2025**

Powered by IBM Watson AI & NVIDIA AI

🚀 **[Get Started](#quick-start)** | 📚 **[Documentation](./docs/)** | 🐛 **[Report Bug](https://github.com/yourusername/rev-bob/issues)** | ⭐ **[Star on GitHub](https://github.com/yourusername/rev-bob)**

</div>
