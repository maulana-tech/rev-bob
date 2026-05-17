# REV-BOB Integration Guide

## Overview

REV-BOB (Code Dependency Explorer AI) telah berhasil diintegrasikan ke dalam DevTools AI Suite. Komponen visualisasi 3D dan graph analysis dari REV-BOB kini tersedia di project ini.

## Struktur Setelah Integrasi

```
devtools-ai-suite/
├── packages/
│   ├── web/              # Next.js frontend (existing)
│   │   └── components/
│   │       ├── GraphView2D.tsx        # ✨ NEW: Advanced Sigma.js graph
│   │       ├── MetricsDashboard.tsx   # ✨ NEW: Metrics visualization
│   │       ├── CodeInspector.tsx      # ✨ NEW: Code inspector panel
│   │       ├── ImpactGraph.tsx        # Existing: D3.js impact graph
│   │       └── KnowledgeGraph.tsx     # Existing: D3.js knowledge graph
│   │
│   └── server/           # ✨ NEW: Node.js + Express server
│       ├── src/
│       │   ├── index.ts              # Main server entry
│       │   ├── routes/
│       │   │   ├── code-review.ts    # CodeReview API
│       │   │   ├── devflow.ts        # DevFlow API
│       │   │   └── legacy-code.ts    # LegacyCode API
│       │   └── services/
│       │       ├── github.ts         # GitHub API client
│       │       └── graph-builder.ts  # Graph construction
│       ├── package.json
│       └── tsconfig.json
│
└── backend/              # Python FastAPI (existing, optional)
```

## Komponen Baru yang Ditambahkan

### 1. Node.js Server (`packages/server/`)

**Technology Stack:**
- Express.js (Web framework)
- TypeScript (Type safety)
- Anthropic SDK (IBM Bob integration)
- Babel Parser (Code analysis)
- Graphology (Graph data structures)

**Features:**
- ✅ REST API untuk CodeReview, DevFlow, LegacyCode
- ✅ GitHub integration (fetch PR, files, diffs)
- ✅ Graph builder service (dependency analysis)
- ✅ IBM Bob / Anthropic AI integration
- ✅ CORS support untuk frontend

### 2. Advanced Graph Visualization Components

#### GraphView2D.tsx
**From REV-BOB**

Advanced Sigma.js-based WebGL graph renderer dengan features:
- ✅ ForceAtlas2 layout algorithm
- ✅ Type-keyed visual encoding (different colors per entity)
- ✅ Hierarchical seed layout (Fermat spiral)
- ✅ Blast-radius simulation
- ✅ Module-based color tinting
- ✅ Interactive node selection
- ✅ Legend for node/edge types

**Visual Encoding:**
- `file` → Hot rose (#FF2D55)
- `function` → Caribbean teal (#00C7BE)
- `class` → Signal amber (#FF9F0A)
- `method` → Spring green (#30D158)
- `python_function` → Python blue (#3572A5)
- `python_class` → Python yellow (#FFD43B)

**Edge Types:**
- `CONTAINS` → Green (structural)
- `DEFINES` → Cyan (structural)
- `IMPORTS` → Blue (dependency)
- `CALLS` → Purple (semantic)
- `EXTENDS` → Orange (inheritance)
- `DOCUMENTS` → Gray (documentation)

#### MetricsDashboard.tsx
**From REV-BOB**

Comprehensive metrics visualization:
- ✅ Complexity analysis
- ✅ Dependency metrics
- ✅ Code health indicators
- ✅ Module statistics
- ✅ Real-time updates

#### CodeInspector.tsx
**From REV-BOB**

Code detail panel:
- ✅ Syntax highlighting
- ✅ Line numbers
- ✅ File path display
- ✅ Entity information
- ✅ Dependency list

## API Endpoints

### CodeReview APIs

```typescript
POST /api/code-review/analyze
Body: { pr_url: string }
Response: {
  success: boolean,
  pr_data: { title, description, author, created_at, changed_files },
  analysis: string,
  impact_graph: { nodes, edges, changed, affected },
  review_comment: string
}

GET /api/code-review/pr/:owner/:repo/:number
Response: GitHub PR data
```

### DevFlow APIs

```typescript
POST /api/devflow/run
Body: { repo_path: string, tasks: string[] }
Response: {
  success: boolean,
  results: {
    tests?: { status, files_generated, content },
    docs?: { status, files_updated, content },
    changelog?: { status, content }
  },
  time_saved_minutes: number
}

GET /api/devflow/analytics
Response: {
  total_automations: number,
  time_saved_hours: number,
  tasks_completed: object,
  success_rate: number
}
```

### LegacyCode APIs

```typescript
POST /api/legacy-code/index
Body: { repo_url: string }
Response: {
  success: boolean,
  index_id: string,
  repo_info: object,
  graph: GraphData
}

POST /api/legacy-code/chat
Body: { index_id: string, question: string }
Response: {
  success: boolean,
  answer: string,
  sources: string[]
}

POST /api/legacy-code/wiki
Body: { index_id: string }
Response: {
  success: boolean,
  wiki_content: string,
  pages_generated: number
}

POST /api/legacy-code/danger-zones
Body: { index_id: string }
Response: {
  success: boolean,
  danger_zones: Array<{
    file: string,
    severity: string,
    issues: string[],
    recommendations: string[]
  }>
}
```

## Development Commands

### Start Everything

```bash
# Start all services (recommended)
pnpm dev:all
# Runs both web (port 3000) and server (port 3001) concurrently

# Or start individually:
pnpm web:dev      # Frontend only
pnpm server:dev   # Node.js server only
pnpm backend:dev  # Python server only (optional)
```

### Server Development

```bash
cd packages/server

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start dev server (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

### Server (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# IBM Bob / Anthropic API
IBM_BOB_API_KEY=your_ibm_bob_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# GitHub API
GITHUB_TOKEN=your_github_personal_access_token

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key_here
```

## Integration dengan Frontend

### Menggunakan GraphView2D

```typescript
import GraphView2D from '@/components/GraphView2D';

// In your component
<GraphView2D
  data={{
    nodes: [
      { id: 'file1', label: 'index.ts', type: 'file', ... },
      { id: 'func1', label: 'handleRequest', type: 'function', ... }
    ],
    edges: [
      { source: 'file1', target: 'func1', kind: 'DEFINES' }
    ]
  }}
  onNodeSelect={(node) => console.log('Selected:', node)}
/>
```

### Memanggil API dari Frontend

```typescript
// packages/web/lib/api.ts
const API_BASE = 'http://localhost:3001/api';

export const api = {
  async analyzePR(prUrl: string) {
    const response = await fetch(`${API_BASE}/code-review/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pr_url: prUrl }),
    });
    return response.json();
  },
  
  async indexRepository(repoUrl: string) {
    const response = await fetch(`${API_BASE}/legacy-code/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_url: repoUrl }),
    });
    return response.json();
  },
};
```

## Dependencies Added

### Server Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.78.0",
  "@babel/parser": "^7.24.0",
  "@babel/traverse": "^7.24.0",
  "cors": "^2.8.5",
  "express": "^4.18.2",
  "graphology": "^0.26.0",
  "openai": "^6.29.0"
}
```

### Web Dependencies (untuk CDE components)

```json
{
  "@sigma/edge-curve": "^3.1.0",
  "graphology": "^0.26.0",
  "graphology-layout-forceatlas2": "^0.10.1",
  "graphology-layout-noverlap": "^0.4.2",
  "sigma": "^3.0.2"
}
```

## Migrasi dari Python Backend (Optional)

Jika ingin fully migrate dari Python ke Node.js:

1. **Keep Both** (Recommended for now):
   - Python backend untuk AI/ML heavy tasks
   - Node.js server untuk graph analysis & GitHub integration

2. **Full Migration**:
   - Pindahkan semua logic dari `backend/` ke `packages/server/`
   - Update frontend API calls
   - Deploy hanya Node.js server

## Performance Considerations

### GraphView2D
- WebGL-based rendering (hardware accelerated)
- Handles 1000+ nodes smoothly
- ForceAtlas2 runs in Web Worker (non-blocking)
- Automatic layout stabilization

### API Server
- Caching untuk GitHub API calls
- Rate limiting untuk IBM Bob API
- Parallel file fetching (up to 100 files)
- Response compression

## Troubleshooting

### Server won't start
```bash
# Check if port 3001 is available
lsof -ti:3001 | xargs kill -9

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### GraphView2D not rendering
```bash
# Install Sigma.js dependencies
cd packages/web
pnpm add sigma @sigma/edge-curve graphology graphology-layout-forceatlas2
```

### CORS errors
- Verify FRONTEND_URL in server .env matches your frontend URL
- Check CORS middleware configuration in `packages/server/src/index.ts`

## Next Steps

1. ✅ **Testing**: Buat integration tests untuk API endpoints
2. ✅ **Documentation**: Tambahkan API documentation dengan Swagger/OpenAPI
3. ✅ **Optimization**: Implement caching layer untuk GitHub API
4. ✅ **Features**: Tambahkan authentication & authorization
5. ✅ **Deployment**: Setup CI/CD untuk automatic deployment

## Credits

**REV-BOB Components:**
- GraphView2D: Advanced Sigma.js WebGL renderer
- MetricsDashboard: Code metrics visualization
- CodeInspector: Syntax-highlighted code viewer

**Original REV-BOB:**
- Architecture: Multi-model AI orchestration
- Features: Structural code intelligence & safe refactor simulation

**DevTools AI Suite:**
- Integration: Seamless merge of REV-BOB features
- Enhancement: IBM Bob-powered code analysis
- UI/UX: Professional, production-ready design

---

**Last Updated**: 2026-05-16  
**Status**: Integration Complete ✅  
**Server**: Running on port 3001  
**Frontend**: Running on port 3000
