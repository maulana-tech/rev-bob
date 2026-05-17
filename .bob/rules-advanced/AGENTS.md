# Project Advanced Coding Rules (Non-Obvious Only)

## Backend TypeScript (backend/)

### ESM Module Requirements
- MUST use `import`/`export` syntax (NOT `require()`)
- File extensions REQUIRED in imports: `import { x } from "./file.js"` (even for .ts)
- `__dirname` unavailable - use `fileURLToPath(import.meta.url)` pattern from `url` module

### Graph Data Constraints
- Hardcoded limits in `backend/index.ts` (NOT configurable):
  - MAX_FILE_BYTES: 2MB per file
  - MAX_SOURCE_FILES: 2500 files
  - MAX_TOTAL_SOURCE_BYTES: 25MB total
  - MAX_UPLOAD_BYTES: 500MB for ZIP uploads

### Multi-LLM Provider Pattern
- Providers tried in order: GLM-5 → ASI:One → Cerebras (actual implementation)
- NO error thrown if all fail - returns empty response (silent failure)
- Custom LLM via CUSTOM_API_KEY, CUSTOM_BASE_URL, CUSTOM_MODEL env vars

### IBM Watsonx.ai Integration (Not Yet Implemented)
- **Authentication**: Requires IBM Cloud IAM token (NOT direct watsonx.ai API key)
- **Token Endpoint**: `https://iam.cloud.ibm.com/identity/token`
- **API Endpoint**: `https://{region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`
- **Required Params**: Both `project_id` AND `space_id` must be provided
- **Model Format**: Full IDs like `ibm/granite-13b-chat-v2` (NOT short names)
- **Token Expiry**: IAM tokens expire after 1 hour - implement refresh logic
- **Rate Limits**: Lite plan: 5 req/min, Standard: 100 req/min
- **Granite Models**: `granite-13b-code-instruct` (code), `granite-13b-chat-v2` (chat)
- **Context Limits**: 8K tokens standard, some models up to 128K
- **Streaming**: Use `stream: true` for SSE responses

### In-Memory Storage
- Graph data stored via `graph-store.ts` - lost on server restart
- NO database persistence for graph data
- Session IDs in IBM Bob client not persisted

## Frontend (packages/web/)

### Vite Configuration
- `base: '/app/'` in vite.config.ts - production builds expect `/app/` subdirectory
- Development mode ignores base path (serves from root)
- Proxy rules: `/health` and `/api` → port 3001

### Legacy Error Messages
- `packages/web/src/lib/api.ts` contains hardcoded "CDE AI" and "rev-bob" references
- These are from original REV-BOB project - NOT actual service names

### API Endpoint Pattern
- Health check at `/health` (NOT `/api/health`)
- All other endpoints at `/api/*`
- Backend is Express on port 3001 (NOT FastAPI on 8000)

## Python Backend (backend/*.py)

### Stub Implementation Only
- Python FastAPI backend is NOT the primary backend
- Most endpoints are TODO stubs
- Express TypeScript backend (port 3001) is the actual implementation
- Python backend (port 8000) rarely used

## Access to MCP and Browser Tools
- Advanced mode HAS access to MCP (Model Context Protocol) tools
- Advanced mode HAS access to Browser tools
- Use these tools when needed for enhanced functionality