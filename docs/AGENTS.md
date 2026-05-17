# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

### Dual Backend Architecture
- **Primary backend**: Express TypeScript (`backend/index.ts`) on port 3001 - ALWAYS use this
- **Secondary backend**: Python FastAPI (`backend/main.py`) on port 8000 - stub implementation only
- Frontend proxies `/api` and `/health` to port 3001 (see `packages/web/vite.config.ts`)
- DO NOT assume FastAPI is the main backend despite Python files existing

### Frontend API Client Pattern
- `packages/web/src/lib/api.ts` has hardcoded error messages referencing "CDE AI" and "rev-bob"
- These are legacy references from the original REV-BOB project
- Backend health check is at `/health` (NOT `/api/health`)
- API base path is `/api` but health endpoint is at root level

### Backend Module System
- Backend uses ESM modules (`"type": "module"` in package.json)
- MUST use `import`/`export` syntax, NOT `require()`
- File extensions required in imports: `import { x } from "./file.js"` (even for .ts files)
- `__dirname` unavailable - use `fileURLToPath(import.meta.url)` pattern

### Graph Data Limits (backend/index.ts)
- MAX_FILE_BYTES: 2MB per file
- MAX_SOURCE_FILES: 2500 files
- MAX_TOTAL_SOURCE_BYTES: 25MB total
- MAX_UPLOAD_BYTES: 500MB for ZIP uploads
- These are hardcoded constants, not configurable via env vars

### Multi-LLM Fallback Strategy
- Backend tries providers in order: GLM-5 → ASI:One → Cerebras (actual implementation in `backend/index.ts`)
- If one fails, automatically tries next configured provider
- Custom LLM support via CUSTOM_API_KEY, CUSTOM_BASE_URL, CUSTOM_MODEL env vars
- NO error thrown if all providers fail - returns empty response (silent failure)

### IBM Watsonx.ai Integration (Not Yet Implemented)
- **Current Status**: Listed as optional enhancement in `HACKATHON_ALIGNMENT.md`
- **When Implementing**: Use IBM Cloud API key (NOT watsonx.ai API key directly)
- **Authentication**: Requires IBM Cloud IAM token via `https://iam.cloud.ibm.com/identity/token`
- **Endpoint Pattern**: `https://{region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`
- **Required Parameters**: `project_id` (from watsonx.ai project) AND `space_id` (from deployment space)
- **Model IDs**: Use full model IDs like `ibm/granite-13b-chat-v2`, NOT short names
- **Token Refresh**: IAM tokens expire after 1 hour - must implement refresh logic
- **Rate Limits**: Vary by plan (Lite: 5 req/min, Standard: 100 req/min)
- **Granite Models**: Optimized for code (granite-13b-code-instruct) and chat (granite-13b-chat-v2)
- **Context Window**: Most Granite models support 8K tokens, some up to 128K
- **Streaming**: Supported via `stream: true` parameter, returns Server-Sent Events (SSE)

### Vite Base Path
- Frontend has `base: '/app/'` in vite.config.ts
- Production builds expect to be served from `/app/` subdirectory
- Development mode ignores this (serves from root)

### Session Management
- Backend uses cookie-parser but NO actual session implementation
- IBM Bob client has session_id concept but it's not persisted
- Graph data stored in-memory via graph-store.ts - lost on restart

## Commands

```bash
# Start both services (Express backend + Vite frontend)
pnpm dev

# Start individually
pnpm web:dev        # Port 3000
pnpm backend:dev    # Port 3001 (Express TypeScript)
pnpm backend:python # Port 8000 (FastAPI stub - rarely used)
```

## Testing

```bash
# No test suite configured yet
# Frontend: cd packages/web && pnpm test (not implemented)
# Backend: cd backend && pnpm test (not implemented)