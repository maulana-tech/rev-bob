# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DevTools AI Suite** is an AI-powered code analysis platform built from **CDE-APP** (Code Dependency Explorer AI). It's a monorepo combining:
- **Frontend**: Vite + React with advanced WebGL graph visualization
- **Backend**: Express + TypeScript server with multi-LLM support
- **Optional**: Python FastAPI for additional ML/AI tasks

**Architecture**: Interactive structural code intelligence with safe refactor simulation, powered by multi-LLM orchestration (Claude, GPT, Groq, Cerebras).

**Key Feature**: Advanced Sigma.js-based graph visualization with WebGL rendering, ForceAtlas2 layout, and comprehensive code structure analysis.

## Development Commands

### Starting Services

```bash
# Start EVERYTHING (frontend + backend) - RECOMMENDED
pnpm dev
# Runs: web (port 3000) + backend (port 3001) concurrently

# Start frontend only (Vite dev server on port 3000)
pnpm web:dev

# Start backend only (Express TypeScript on port 3001)
pnpm backend:dev

# Start Python backend (FastAPI on port 8000) - OPTIONAL
pnpm backend:python
```

### Building

```bash
# Build everything
pnpm build

# Build frontend only
pnpm web:build

# Build backend only
pnpm backend:build
```

### Testing

```bash
# Frontend tests
cd packages/web && pnpm test

# Backend tests (Python)
cd backend && pytest
```

### Development Tools

```bash
# Format code
pnpm format

# Clean all build artifacts
pnpm clean
```

## Project Structure

### Monorepo Layout
```
devtools-ai-suite/
├── packages/
│   └── web/                    # Vite + React frontend
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/     # All React components
│       │   ├── lib/            # Utilities
│       │   ├── types/          # TypeScript types
│       │   └── index.css       # Styles
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
└── backend/                     # Express + TypeScript server
    ├── index.ts                 # Main server entry
    ├── github.ts                # GitHub API integration
    ├── graph-builder.ts         # Graph construction
    ├── parser.ts                # Code parsing (Babel)
    ├── mcp-server.ts            # Model Context Protocol
    ├── types/
    ├── package.json
    ├── tsconfig.json
    │
    ├── main.py                  # Python FastAPI (optional)
    ├── requirements.txt
    ├── api/                     # Python routes
    ├── agents/                  # Python agents
    └── services/                # Python services
```

### Frontend Architecture (`packages/web/`)

**Technology**: Vite + React + TypeScript

**Key Components** (`src/components/`):
- **GraphView2D.tsx** - Advanced Sigma.js WebGL graph renderer with ForceAtlas2 layout
- **MetricsDashboard.tsx** - Code complexity & quality metrics visualization
- **CodeInspector.tsx** - Syntax-highlighted code viewer with line numbers
- **ExplorerPanel.tsx** - File system navigation and exploration
- **QueryPanel.tsx** - Multi-agent analysis interface
- **AgentPanel.tsx** - Agent orchestration UI
- **ProcessPanel.tsx** - Process visualization and management
- **FilterPanel.tsx** - Graph filtering controls
- **MetricsPanel.tsx** - Real-time metrics display
- **NodeIntelligence.tsx** - Node detail analysis
- **UploadZone.tsx** - Drag-and-drop file upload

**Routing**: Single-page app with React state management

**Styling**: Custom CSS with design system (`index.css`)

### Backend Architecture (`backend/`)

**Main Server** (`index.ts`):
- Express.js with TypeScript
- CORS configured for frontend
- Multi-LLM support (Claude, GPT, Groq, Cerebras, Gemini)
- File upload with Multer
- Cookie-based sessions

**Services**:
- **github.ts** - GitHub API client (fetch repos, files, create PRs)
- **graph-builder.ts** - Build dependency graphs from code
- **parser.ts** - Parse JavaScript/TypeScript with Babel
- **graph-store.ts** - In-memory graph storage
- **mcp-server.ts** - Model Context Protocol server

**Key Features**:
- TypeScript with ESM modules
- Hot reload with `tsx watch`
- Babel parser for code analysis
- Graphology for graph data structures
- Multi-LLM orchestration with fallbacks

## Key Technologies

### Frontend Stack
- **Vite 5.2** - Fast build tool with HMR
- **React 18.3** - UI library
- **TypeScript 5.4** - Type safety
- **Sigma.js 3.0** - WebGL graph rendering
- **D3.js 7.9** - Data visualization
- **Three.js 0.169** - 3D graphics
- **Graphology 0.26** - Graph data structures
- **GSAP 3.14** - Animation
- **Mermaid 11.13** - Diagram generation
- **React Syntax Highlighter** - Code highlighting

### Backend Stack (TypeScript)
- **Express 4.18** - Web framework
- **Anthropic SDK 0.78** - Claude integration
- **OpenAI SDK 6.29** - GPT integration
- **Groq SDK 1.1** - Groq integration
- **Cerebras SDK 1.64** - Cerebras integration
- **Google Generative AI 0.24** - Gemini integration
- **Babel Parser 7.24** - Code parsing
- **MCP SDK 1.27** - Model Context Protocol
- **AdmZip 0.5** - ZIP handling
- **Multer** - File uploads

### Backend Stack (Python - Optional)
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **httpx** - Async HTTP client

## Environment Variables

### Backend `.env` (`backend/.env`)
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# LLM Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=csk-...
GOOGLE_API_KEY=AIza...

# GitHub Integration
GITHUB_TOKEN=ghp_...

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Optional: Custom LLM
CUSTOM_API_KEY=
CUSTOM_BASE_URL=
CUSTOM_MODEL=
```

### Python Backend (Optional - `backend/.env`)
```bash
# FastAPI configuration
DATABASE_URL=sqlite:///./devtools.db
```

## URLs and Endpoints

### Development URLs
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:3001 (Express TypeScript)
- **Backend Health**: http://localhost:3001/health
- **Python Backend**: http://localhost:8000 (FastAPI - optional)

### API Endpoints (Express)

**Graph Operations**:
- `POST /upload` - Upload codebase (ZIP or files)
- `POST /github` - Fetch from GitHub repository
- `GET /graph` - Get dependency graph

**Analysis**:
- `POST /query` - Query codebase with natural language
- `POST /agents` - Multi-agent analysis (security, architecture, performance, quality, onboarding)
- `POST /process` - Process visualization and analysis
- `POST /report` - Generate comprehensive report

**GitHub Integration**:
- `POST /github/pr` - Create pull request
- `POST /github/branch` - Create branch
- `GET /github/file` - Get file content
- `POST /github/file` - Update file content

**LLM Configuration**:
- `POST /llm/config` - Configure custom LLM
- `GET /llm/providers` - List available LLM providers

**Health & Status**:
- `GET /health` - Server health check
- `GET /` - Landing page

## Development Workflow

### Frontend Changes
1. Vite provides instant HMR (< 50ms)
2. Edit files in `packages/web/src/`
3. Changes appear immediately in browser
4. TypeScript errors shown in console

### Backend Changes
1. `tsx watch` provides hot reload
2. Edit files in `backend/`
3. Server restarts automatically
4. Check logs in terminal

### Full-Stack Features
1. Start both services: `pnpm dev`
2. Frontend makes API calls to backend
3. Backend processes with LLMs
4. Results displayed in graph visualization

## GraphView2D Component

**Location**: `packages/web/src/components/GraphView2D.tsx`

**Technology**: Sigma.js + WebGL + ForceAtlas2

**Features**:
- Hardware-accelerated WebGL rendering (60fps with 1000+ nodes)
- ForceAtlas2 physics simulation (Web Worker)
- Hierarchical seed layout (Fermat spiral)
- Type-keyed visual encoding
- Module-based color tinting
- Blast-radius impact visualization
- Interactive node selection & drag
- Real-time layout stabilization

**Node Types** (color-coded):
- `file` → Hot rose (#FF2D55)
- `function` → Caribbean teal (#00C7BE)
- `class` → Signal amber (#FF9F0A)
- `method` → Spring green (#30D158)
- `python_function` → Python blue (#3572A5)
- `python_class` → Python yellow (#FFD43B)
- `config` → Amber (#FF9F0A)
- `doc` → Gray (#888888)

**Edge Types**:
- `CONTAINS` → Green (structural containment)
- `DEFINES` → Cyan (definition)
- `IMPORTS` → Blue (dependency)
- `CALLS` → Purple (function calls)
- `EXTENDS` → Orange (inheritance)
- `DOCUMENTS` → Gray (documentation)

**Usage**:
```typescript
import GraphView2D from './components/GraphView2D';

<GraphView2D
  data={graphData}
  onNodeClick={(node) => console.log(node)}
  onEdgeClick={(edge) => console.log(edge)}
/>
```

## Common Patterns

### Backend API Handler Pattern
```typescript
app.post('/endpoint', async (req, res) => {
  try {
    const { param } = req.body;
    const result = await processWithLLM(param);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Multi-LLM Orchestration Pattern
```typescript
const providers: LLMProvider[] = [
  {
    name: 'anthropic',
    isConfigured: !!process.env.ANTHROPIC_API_KEY,
    call: async () => {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0].text;
    }
  },
  // ... other providers
];

// Try providers in order until one succeeds
for (const provider of providers) {
  if (provider.isConfigured) {
    try {
      return await provider.call();
    } catch (error) {
      console.warn(`${provider.name} failed, trying next`);
    }
  }
}
```

### Frontend API Call Pattern
```typescript
const analyzeCode = async (codebase: string) => {
  try {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: codebase })
    });
    const data = await response.json();
    setResult(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Important Notes

### General
- **Multi-LLM Support** - Backend can use any configured LLM (Claude, GPT, Groq, Cerebras, Gemini)
- **Fallback Strategy** - If one LLM fails, automatically tries the next available
- **Hot Reload** - Both frontend (Vite HMR) and backend (tsx watch) support hot reload
- **TypeScript Throughout** - Full type safety across frontend and backend
- **WebGL Rendering** - Graph visualization uses hardware acceleration
- **NO EMOJIS** - Professional interface, no emoji icons

### Frontend
- Uses **Vite** (not Next.js) - faster HMR and simpler config
- Single-page application - no routing, state managed in React
- Custom CSS - no Tailwind, uses design system in `index.css`
- Components are in `src/components/` - flat structure
- All styling uses CSS variables defined in `index.css`

### Backend
- **TypeScript with ESM** - use `import`/`export` syntax
- **Express** - traditional Express patterns, not FastAPI style
- **Multi-LLM** - supports multiple providers with automatic fallback
- **Hot Reload** - tsx watch restarts on file changes
- **CORS** - automatically configured for `http://localhost:3000`
- **File Upload** - supports ZIP uploads up to 500MB
- **Graph Storage** - in-memory store, lost on server restart

### Python Backend (Optional)
- Python virtual environment should be activated
- FastAPI routes are in `backend/api/`
- Can run alongside TypeScript server

### pnpm Workspace
- Use `pnpm` (not npm or yarn) at root level
- Individual packages can use `pnpm` within their directories
- Workspace packages are linked automatically

## Troubleshooting

### Port Issues
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Dependencies Issues
```bash
# Clean and reinstall
pnpm clean
rm -rf pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Check TypeScript compilation
cd backend && pnpm build        # Backend
cd packages/web && pnpm build  # Frontend
```

### CORS Issues
- Verify `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Default is `http://localhost:3000`
- Update in `backend/index.ts` if using different port

### Graph Not Rendering
- Check browser console for WebGL errors
- Ensure Sigma.js dependencies installed: `cd packages/web && pnpm install`
- Verify GPU acceleration enabled in browser

## Additional Documentation

- **MIGRATION_COMPLETE.md** - Complete migration guide and changelog
- **CDE_INTEGRATION.md** - Original integration documentation
- **cde-app/README.md** - Original CDE-APP documentation
- **README.md** - Project overview

---

**Architecture**: Vite + React + Express + TypeScript + Multi-LLM  
**Primary Backend**: Express TypeScript (port 3001)  
**Optional Backend**: Python FastAPI (port 8000)  
**Frontend**: Vite React (port 3000)  
**Graph Engine**: Sigma.js WebGL with ForceAtlas2  
**Status**: Production-ready ✅
