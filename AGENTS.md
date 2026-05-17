# AGENTS.md

Quick reference for agents. See `docs/AGENTS.md` for detailed guidance.

## Critical Non-Obvious Patterns

- **Primary backend**: Express TypeScript (`backend/index.ts`) on port 3001 — always use this, not the Python FastAPI stub on port 8000
- **Backend ESM**: Uses ESM modules — must use `import`/`export`, require `.js` extensions in imports (even for .ts files), use `fileURLToPath(import.meta.url)` instead of `__dirname`
- **Health endpoint**: `/health` (NOT `/api/health`)
- **Vite base path**: `base: '/app/'` in vite.config.ts — production builds expect `/app/` subdirectory

## Commands

```bash
pnpm dev           # Both frontend (3000) + backend (3001)
pnpm web:dev       # Frontend only
pnpm backend:dev   # Backend only (Express TS)
pnpm format        # Prettier formatting
pnpm clean         # Remove build artifacts
```

## Testing

No test suite configured. `pnpm test` not implemented in either package.

## Graph Data Limits

Hardcoded in `backend/index.ts`: MAX_FILE_BYTES=2MB, MAX_SOURCE_FILES=2500, MAX_TOTAL_SOURCE_BYTES=25MB, MAX_UPLOAD_BYTES=500MB.

## Multi-LLM Fallback

Providers tried in order (GLM-5 → ASI:One → Cerebras). Silent failure — returns empty response if all fail.