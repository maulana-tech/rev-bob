# Project Architecture Rules (Non-Obvious Only)

## Backend Architecture Constraints

### Dual Backend Pattern
- Express TypeScript (port 3001) is PRIMARY - handles all graph operations, LLM calls, GitHub integration
- Python FastAPI (port 8000) is SECONDARY - stub implementation with TODO endpoints
- When planning features, default to Express backend unless Python-specific ML/AI needed
- Python backend agents (code_review, devflow, legacy_code) are NOT implemented

### Multi-LLM Orchestration
- Backend tries providers sequentially: GLM-5 → ASI:One → Cerebras (actual implementation)
- NO error if all fail - returns empty response (silent failure)
- Plan error handling assuming LLM calls may silently fail
- Custom LLM support exists but requires all three env vars (KEY, BASE_URL, MODEL)

### IBM Watsonx.ai Integration Constraints (Not Yet Implemented)
- **Authentication Flow**: Must obtain IBM Cloud IAM token first, THEN call watsonx.ai API
- **Token Management**: IAM tokens expire after 1 hour - plan for token refresh mechanism
- **Dual Identifiers**: Requires BOTH `project_id` (from watsonx.ai project) AND `space_id` (from deployment space)
- **Model Naming**: Must use full model IDs (`ibm/granite-13b-chat-v2`), NOT short names
- **Rate Limiting**: Plan for rate limits (Lite: 5 req/min, Standard: 100 req/min)
- **Regional Endpoints**: API endpoint varies by region (`us-south`, `eu-de`, `jp-tok`, etc.)
- **Granite Model Selection**: Use `granite-13b-code-instruct` for code tasks, `granite-13b-chat-v2` for chat
- **Context Window Planning**: Standard 8K tokens, some models support up to 128K
- **Streaming Support**: Plan for SSE (Server-Sent Events) if using `stream: true`

### Data Persistence Strategy
- Graph data is in-memory only (`graph-store.ts`)
- NO database for graph persistence
- Session state lost on restart
- Plan features assuming stateless server or implement external storage

## Frontend Architecture Constraints

### Build Configuration
- Production builds expect `/app/` subdirectory deployment
- Development serves from root (different behavior)
- Plan deployment considering base path mismatch
- Static assets must account for `/app/` prefix in production

### API Communication
- Health check at `/health` (NOT `/api/health`)
- All other endpoints at `/api/*`
- Proxy only works in development (vite.config.ts)
- Plan production deployment with reverse proxy or CORS

### Legacy Code References
- Error messages reference "CDE AI" and "rev-bob" (from original REV-BOB)
- These are NOT actual service names
- Plan refactoring to remove legacy references if user-facing

## Scalability Constraints

### Hardcoded Limits
- MAX_FILE_BYTES: 2MB per file (hardcoded in `backend/index.ts`)
- MAX_SOURCE_FILES: 2500 files
- MAX_TOTAL_SOURCE_BYTES: 25MB total
- MAX_UPLOAD_BYTES: 500MB for ZIP
- NOT configurable via env vars - requires code changes to scale

### Performance Bottlenecks
- Graph stored entirely in memory (no pagination)
- All LLM calls are sequential (no parallel processing)
- File parsing happens synchronously during upload
- Plan for these bottlenecks when designing large-scale features

## Module System Constraints

### ESM-Only Backend
- Backend uses `"type": "module"` - cannot use CommonJS
- Import paths must include `.js` extension (even for `.ts` files)
- `__dirname` unavailable - must use `fileURLToPath(import.meta.url)`
- Plan migrations considering ESM-only constraint