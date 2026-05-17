# Project Documentation Rules (Non-Obvious Only)

## Architecture Context

### Dual Backend System
- Express TypeScript (`backend/index.ts`) on port 3001 is PRIMARY backend
- Python FastAPI (`backend/main.py`) on port 8000 is SECONDARY (stub only)
- When explaining architecture, clarify Express is the main implementation
- Python backend exists but most endpoints are TODO stubs

### Frontend Structure
- Uses Vite (NOT Next.js) despite having `packages/web-old-backup/` with Next.js
- Single-page application with React state management (no routing library)
- Custom CSS design system in `index.css` (NOT Tailwind)

### Legacy References
- `packages/web/src/lib/api.ts` contains "CDE AI" and "vectron-app" error messages
- These are from original CDE-APP project by Anthropic
- NOT actual service names in this project

## API Endpoint Patterns

### Health Check Location
- Health endpoint is at `/health` (root level)
- NOT at `/api/health` like other endpoints
- This is intentional for load balancer compatibility

### Proxy Configuration
- Frontend proxies `/health` and `/api` to port 3001
- Configured in `packages/web/vite.config.ts`
- Development only - production needs different setup

## Module System

### Backend ESM Modules
- Backend uses `"type": "module"` in package.json
- MUST explain imports need `.js` extension even for `.ts` files
- `__dirname` not available - use `fileURLToPath(import.meta.url)`

## Data Persistence

### In-Memory Storage
- Graph data stored in-memory via `graph-store.ts`
- NO database persistence for graph data
- Data lost on server restart
- IBM Bob session IDs not persisted

## Build Configuration

### Vite Base Path
- Production builds use `base: '/app/'` in vite.config.ts
- Expects deployment to `/app/` subdirectory
- Development mode ignores this (serves from root)
- Important for deployment documentation