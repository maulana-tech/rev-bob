# API Endpoints Documentation

Complete list of all backend API endpoints with authentication, request/response formats.

---

## Table of Contents

1. [Core CDE-APP Endpoints](#core-cde-app-endpoints)
2. [GitHub Integration](#github-integration)
3. [DevTools AI Suite](#devtools-ai-suite)
   - [CodeReview Copilot](#codereview-copilot)
   - [DevFlow Automator](#devflow-automator)
   - [LegacyCode Explainer](#legacycode-explainer)

---

## Core CDE-APP Endpoints

### Health Check

**GET** `/health`

Check server health status.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Upload Codebase

**POST** `/api/upload`

Upload a codebase (ZIP file or multiple files) for analysis.

**Request:** multipart/form-data
- `files`: File or multiple files

**Response:**
```json
{
  "success": true,
  "graph": {
    "nodes": [...],
    "edges": [...],
    "crossModuleEdges": [...]
  }
}
```

---

### Clone GitHub Repository

**POST** `/api/clone`

Clone and analyze a GitHub repository.

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "success": true,
  "graph": {
    "nodes": [...],
    "edges": [...],
    "crossModuleEdges": [...]
  }
}
```

---

### Query Codebase

**POST** `/api/query`

Ask natural language questions about the codebase.

**Request:**
```json
{
  "query": "What does the authentication module do?",
  "context": {}
}
```

**Response:**
```json
{
  "answer": "The authentication module handles...",
  "sources": [...],
  "confidence": 0.95
}
```

---

### Node Summary

**POST** `/api/node-summary`

Get detailed information about a specific node in the graph.

**Request:**
```json
{
  "nodeId": "src/auth.ts:AuthService",
  "type": "class"
}
```

**Response:**
```json
{
  "id": "src/auth.ts:AuthService",
  "type": "class",
  "summary": "...",
  "dependencies": [...],
  "dependents": [...]
}
```

---

### Process Visualization

**POST** `/api/processes`

Get process flow diagrams and analysis.

**Request:**
```json
{
  "process": "authentication",
  "format": "mermaid"
}
```

**Response:**
```json
{
  "diagram": "graph TD\n  A[User] --> B[Login]",
  "analysis": "..."
}
```

---

### Generate Report

**POST** `/api/report`

Generate comprehensive codebase analysis report.

**Request:**
```json
{
  "format": "markdown",
  "sections": ["architecture", "metrics", "issues"]
}
```

**Response:**
```json
{
  "report": "# Codebase Analysis Report\n\n...",
  "format": "markdown"
}
```

---

### Agent Analysis

**POST** `/api/agent-analysis`

Multi-agent analysis with specialized agents.

**Request:**
```json
{
  "agents": ["security", "architecture", "performance"],
  "context": {}
}
```

**Response:**
```json
{
  "security": {
    "findings": [...],
    "severity": "high"
  },
  "architecture": {
    "patterns": [...],
    "recommendations": [...]
  },
  "performance": {
    "bottlenecks": [...],
    "optimizations": [...]
  }
}
```

---

### Get File Content

**POST** `/api/file`

Get the content of a specific file from uploaded codebase.

**Request:**
```json
{
  "path": "src/auth.ts"
}
```

**Response:**
```json
{
  "content": "import ...",
  "path": "src/auth.ts"
}
```

---

## GitHub Integration

### GitHub OAuth - Start Authentication

**GET** `/api/github/auth`

Initiate GitHub OAuth flow.

**Response:** Redirects to GitHub OAuth page

**Environment Variables Required:**
- `GITHUB_CLIENT_ID`: GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret
- `GITHUB_REDIRECT_URI`: Callback URL (default: http://localhost:3001/api/github/callback)

---

### GitHub OAuth - Callback

**GET** `/api/github/callback`

Handle GitHub OAuth callback.

**Query Parameters:**
- `code`: OAuth authorization code
- `state`: State token for CSRF protection

**Response:** Redirects to `/app?logged_in=true` with httpOnly cookie

---

### Get Current User

**GET** `/api/github/me`

Get authenticated GitHub user information.

**Headers:**
- `Authorization: Bearer <token>` (optional, uses cookie if not provided)

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": 12345,
    "login": "username",
    "name": "User Name",
    "email": "user@example.com",
    "avatar_url": "https://..."
  }
}
```

---

### Logout

**POST** `/api/github/logout`

Logout and clear GitHub token.

**Response:**
```json
{
  "success": true
}
```

---

### Get File from GitHub

**GET** `/api/github/file`

Get a specific file from a GitHub repository.

**Query Parameters:**
- `githubUrl`: Repository URL
- `path`: File path

**Headers:**
- `Authorization: Bearer <token>` or cookie

**Response:**
```json
{
  "content": "file content",
  "path": "src/file.ts"
}
```

---

### Update File on GitHub

**POST** `/api/github/file`

Update a file in a GitHub repository.

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo",
  "path": "src/file.ts",
  "content": "new content",
  "message": "Update file.ts",
  "branch": "main"
}
```

**Response:**
```json
{
  "success": true,
  "commit": {
    "sha": "abc123",
    "url": "https://..."
  }
}
```

---

### List Repository Files

**POST** `/api/github/files`

List all files in a GitHub repository.

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo",
  "path": "src"
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "src/index.ts",
      "type": "file",
      "size": 1234
    }
  ]
}
```

---

### Create Branch

**POST** `/api/github/branch`

Create a new branch in a GitHub repository.

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo",
  "branchName": "feature/new-feature",
  "fromBranch": "main"
}
```

**Response:**
```json
{
  "success": true,
  "branch": {
    "name": "feature/new-feature",
    "ref": "refs/heads/feature/new-feature",
    "sha": "abc123"
  }
}
```

---

### Create Pull Request

**POST** `/api/github/pr`

Create a pull request on GitHub.

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo",
  "title": "Add new feature",
  "body": "This PR adds...",
  "head": "feature/new-feature",
  "base": "main"
}
```

**Response:**
```json
{
  "success": true,
  "pr": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123",
    "title": "Add new feature"
  }
}
```

---

### Safe Refactor with Impact Analysis

**POST** `/api/github/refactor`

Perform safe refactoring with impact analysis before committing.

**Request:**
```json
{
  "githubUrl": "https://github.com/owner/repo",
  "changes": [
    {
      "path": "src/auth.ts",
      "content": "new content"
    }
  ],
  "message": "Refactor authentication",
  "branch": "refactor/auth"
}
```

**Response:**
```json
{
  "success": true,
  "impact": {
    "filesChanged": 1,
    "affectedModules": ["auth", "api"],
    "riskLevel": "low"
  },
  "commit": {
    "sha": "abc123",
    "url": "https://..."
  }
}
```

---

## DevTools AI Suite

### CodeReview Copilot

#### Analyze Pull Request

**POST** `/api/code-review/analyze`

Analyze a GitHub Pull Request with AI-powered code review.

**Request:**
```json
{
  "pr_url": "https://github.com/owner/repo/pull/123",
  "options": {
    "check_security": true,
    "check_performance": true,
    "check_quality": true
  }
}
```

**Response:**
```json
{
  "status": "success",
  "pr_data": {
    "number": 123,
    "title": "Add new feature",
    "author": "username",
    "state": "open",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "files_changed": 5
  },
  "analysis": {
    "summary": "This PR adds...",
    "files": [
      {
        "path": "src/auth.ts",
        "additions": 50,
        "deletions": 10,
        "status": "modified"
      }
    ]
  },
  "impact_graph": {
    "changed_files": [...],
    "total_impact": 5
  },
  "comments": []
}
```

**Features:**
- ✅ Fetches PR data from GitHub
- ✅ Analyzes diff with Multi-LLM
- ✅ Identifies bugs and security issues
- ✅ Provides code quality suggestions
- ✅ Builds impact graph

---

### DevFlow Automator

#### Generate Unit Tests

**POST** `/api/devflow/generate-tests`

Auto-generate unit tests for code files.

**Request:**
```json
{
  "repo_path": "/path/to/repo",
  "file_paths": ["src/auth.ts", "src/api.ts"],
  "options": {
    "framework": "jest",
    "coverage": "full"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "tests_generated": 2,
  "test_content": "import { describe, it, expect } from 'jest'...",
  "files": [
    {
      "path": "src/auth.test.ts",
      "content": "..."
    },
    {
      "path": "src/api.test.ts",
      "content": "..."
    }
  ]
}
```

**Features:**
- ✅ LLM-powered test generation
- ✅ Modern testing framework support
- ✅ Edge case coverage
- ✅ Mock external dependencies

---

#### Update Documentation

**POST** `/api/devflow/update-docs`

Auto-update project documentation.

**Request:**
```json
{
  "repo_path": "/path/to/repo",
  "format": "markdown",
  "options": {
    "sections": ["api", "architecture", "setup"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "docs_generated": true,
  "format": "markdown",
  "content": "# API Documentation\n\n...",
  "files": [
    {
      "path": "README.md",
      "content": "..."
    },
    {
      "path": "API.md",
      "content": "..."
    },
    {
      "path": "CONTRIBUTING.md",
      "content": "..."
    }
  ]
}
```

**Features:**
- ✅ LLM-powered documentation
- ✅ Multiple output formats
- ✅ Comprehensive coverage
- ✅ Best practices

---

#### Generate Changelog

**POST** `/api/devflow/generate-changelog`

Auto-generate changelog from commits.

**Request:**
```json
{
  "repo_path": "/path/to/repo",
  "since_version": "v1.0.0",
  "options": {
    "format": "keepachangelog"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "changelog": "## [1.1.0] - 2024-01-15\n\n### Added\n- New feature...",
  "format": "keepachangelog",
  "version": "v1.0.0"
}
```

**Features:**
- ✅ Keep a Changelog format
- ✅ Semantic versioning
- ✅ Categorized changes
- ✅ LLM-powered summaries

---

#### Get Analytics

**GET** `/api/devflow/analytics`

Get DevFlow automation analytics and metrics.

**Response:**
```json
{
  "total_automations": 42,
  "time_saved_hours": 156.5,
  "tasks_completed": {
    "tests": 15,
    "docs": 12,
    "changelog": 15
  },
  "success_rate": 0.95,
  "last_30_days": {
    "automations": 25,
    "time_saved": 87.5
  }
}
```

**Features:**
- ✅ Real-time metrics
- ✅ Time savings tracking
- ✅ Success rate monitoring
- ✅ Historical data

---

### LegacyCode Explainer

#### Analyze Repository

**POST** `/api/legacy-code/analyze`

Analyze a repository and build a knowledge graph.

**Request:**
```json
{
  "repo_url": "https://github.com/owner/repo",
  "options": {
    "max_files": 100,
    "include_tests": false
  }
}
```

**Response:**
```json
{
  "status": "success",
  "index_id": "owner-repo-1234567890",
  "repository": "owner/repo",
  "knowledge_graph": {
    "nodes": [...],
    "edges": [...],
    "crossModuleEdges": [...]
  },
  "stats": {
    "total_files": 250,
    "indexed_files": 100,
    "total_nodes": 500,
    "total_edges": 750
  }
}
```

**Features:**
- ✅ Fetches repository from GitHub
- ✅ Parses code files
- ✅ Builds knowledge graph
- ✅ Indexes for RAG chat

---

#### RAG-Powered Chat

**POST** `/api/legacy-code/chat`

Chat with your codebase using RAG (Retrieval-Augmented Generation).

**Request:**
```json
{
  "index_id": "owner-repo-1234567890",
  "question": "How does the authentication module work?",
  "context": {
    "previous_questions": []
  }
}
```

**Response:**
```json
{
  "status": "success",
  "index_id": "owner-repo-1234567890",
  "question": "How does the authentication module work?",
  "answer": "The authentication module uses JWT tokens...",
  "sources": [
    "Based on codebase analysis",
    "Derived from code structure"
  ],
  "confidence": 0.85
}
```

**Features:**
- ✅ RAG-powered answers
- ✅ Context-aware responses
- ✅ Source citations
- ✅ Confidence scoring

---

#### Generate Wiki

**POST** `/api/legacy-code/wiki`

Generate comprehensive wiki documentation.

**Request:**
```json
{
  "index_id": "owner-repo-1234567890",
  "options": {
    "sections": ["architecture", "api", "development"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "index_id": "owner-repo-1234567890",
  "wiki_content": "# Architecture Overview\n\n...",
  "pages_generated": 5,
  "format": "markdown"
}
```

**Features:**
- ✅ LLM-powered documentation
- ✅ Structured Markdown
- ✅ Multiple sections
- ✅ Best practices

---

#### Detect Danger Zones

**POST** `/api/legacy-code/danger-zones`

Detect security vulnerabilities and code quality issues.

**Request:**
```json
{
  "index_id": "owner-repo-1234567890",
  "options": {
    "severity": ["critical", "high"],
    "categories": ["security", "performance"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "index_id": "owner-repo-1234567890",
  "danger_zones": [
    {
      "file": "src/auth/authentication.ts",
      "severity": "critical",
      "category": "security",
      "issues": [
        "Hardcoded credentials",
        "Weak password hashing"
      ],
      "recommendations": [
        "Use environment variables",
        "Implement bcrypt"
      ],
      "lines": [45, 67]
    }
  ],
  "total_issues": 3,
  "critical": 1,
  "high": 1,
  "medium": 1,
  "analysis_summary": "Found 3 critical issues..."
}
```

**Features:**
- ✅ Security vulnerability detection
- ✅ Performance bottleneck identification
- ✅ Code quality analysis
- ✅ Actionable recommendations

---

## Authentication

### GitHub Token (Recommended)

**Method 1: OAuth (Browser)**
1. Navigate to http://localhost:3000/app
2. Click "Login with GitHub"
3. Authorize the application
4. Token stored in httpOnly cookie

**Method 2: Bearer Token (API)**
```bash
curl -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  http://localhost:3001/api/github/me
```

**Method 3: Environment Variable**
```bash
# backend/.env
GITHUB_TOKEN=your_github_token_here
```

---

## Environment Setup

### Required Configuration

Create `backend/.env`:

```bash
# Server
PORT=3001
NODE_ENV=development

# LLM Providers (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=csk-...
GOOGLE_API_KEY=AIza...

# GitHub OAuth (optional, for browser auth)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/github/callback

# GitHub Token (alternative to OAuth)
GITHUB_TOKEN=ghp_...

# Frontend URL
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3001
```

### GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: DevTools AI Suite
   - **Homepage URL**: http://localhost:3001
   - **Authorization callback URL**: http://localhost:3001/api/github/callback
4. Copy Client ID and Client Secret to `.env`

---

## Multi-LLM Support

The backend automatically tries LLM providers in this order:

1. **Anthropic Claude** (Claude 3.5 Sonnet)
2. **OpenAI** (GPT-4 Turbo)
3. **Groq** (Mixtral 8x7b)
4. **Cerebras** (Llama 3.1 70B)
5. **Google Gemini** (Gemini 1.5 Pro)
6. **Custom LLM** (if configured)

If one fails, it automatically falls back to the next available provider.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description",
  "status": "failed"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (missing/invalid GitHub token)
- `500`: Internal Server Error

---

## Testing Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:3001/health

# Query codebase
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What does this code do?"}'

# Analyze PR
curl -X POST http://localhost:3001/api/code-review/analyze \
  -H "Content-Type: application/json" \
  -d '{"pr_url": "https://github.com/owner/repo/pull/123"}'

# Generate tests
curl -X POST http://localhost:3001/api/devflow/generate-tests \
  -H "Content-Type: application/json" \
  -d '{"file_paths": ["src/auth.ts"]}'
```

### Using the Frontend

Visit http://localhost:3000/app and use the interactive UI to test all features.

---

## Summary

**Total Endpoints**: 29

**Core CDE-APP**: 10 endpoints  
**GitHub Integration**: 10 endpoints  
**DevTools AI Suite**: 9 endpoints  

**Authentication**:
- ✅ GitHub OAuth (Browser)
- ✅ Bearer Token (API)
- ✅ Environment Variable

**Features**:
- ✅ Code analysis with dependency graphs
- ✅ Natural language queries
- ✅ Multi-agent analysis
- ✅ GitHub integration (clone, PR, refactor)
- ✅ AI-powered code review
- ✅ Test generation
- ✅ Documentation generation
- ✅ RAG-powered codebase chat
- ✅ Security vulnerability detection

**Status**: ✅ **All endpoints working and tested**
