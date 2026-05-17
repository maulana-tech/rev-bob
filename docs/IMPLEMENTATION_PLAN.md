# DevTools AI Suite - Implementation Plan

## 🎯 Project Goal

Build a unified AI-powered developer tools platform inspired by GitNexus architecture, enhanced with IBM Bob multi-agent system for intelligent code analysis, review, and automation.

## 📋 Prerequisites

- Node.js 18+ & pnpm
- Python 3.11+
- IBM Bob API access
- GitHub Personal Access Token
- Git installed

## 🏗️ Project Structure

```
devtools-ai-suite/
├── packages/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities
│   │   └── public/           # Static assets
│   ├── core/                  # Agent system core
│   │   ├── agents/           # Agent implementations
│   │   ├── orchestrator/     # Main coordinator
│   │   └── types/            # TypeScript types
│   ├── shared/                # Shared utilities
│   │   ├── types/            # Common types
│   │   └── utils/            # Helper functions
│   └── bob-client/            # IBM Bob SDK wrapper
│       ├── client.ts         # Main client
│       └── prompts/          # Prompt templates
├── backend/                   # FastAPI server
│   ├── api/                  # API routes
│   ├── agents/               # Python agent implementations
│   ├── services/             # Business logic
│   └── models/               # Data models
├── docs/                      # Documentation
├── scripts/                   # Build & deploy scripts
└── tests/                     # Test suites
```

## ⏱️ 48-Hour Timeline

### Phase 1: Foundation (Hours 0-12)

#### Hour 0-2: Project Setup
```bash
# Initialize monorepo
npx create-turbo@latest devtools-ai-suite
cd devtools-ai-suite

# Setup packages
cd packages
npx create-next-app@latest web --typescript --tailwind --app
mkdir core shared bob-client

# Setup backend
cd ../
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn python-dotenv pydantic httpx
```

**Deliverables**:
- ✅ Monorepo structure
- ✅ Next.js app initialized
- ✅ FastAPI backend initialized
- ✅ Git repository setup

#### Hour 2-4: Core Infrastructure

**Backend Tasks**:
1. Create FastAPI app structure
```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DevTools AI Suite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

2. IBM Bob client wrapper
```python
# backend/services/bob_client.py
import os
from typing import Dict, Any

class IBMBobClient:
    def __init__(self):
        self.api_key = os.getenv("IBM_BOB_API_KEY")
        self.base_url = os.getenv("IBM_BOB_BASE_URL")
    
    async def analyze(self, prompt: str, context: Dict[str, Any]) -> str:
        # IBM Bob API integration
        pass
```

3. GitHub API client
```python
# backend/services/github_client.py
import httpx
from typing import Dict, Any

class GitHubClient:
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    async def fetch_pr(self, owner: str, repo: str, pr_number: int) -> Dict[str, Any]:
        # Fetch PR data
        pass
```

**Frontend Tasks**:
1. Setup shadcn/ui
```bash
cd packages/web
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input tabs
```

2. Create basic layout
```tsx
// packages/web/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Deliverables**:
- ✅ FastAPI running on port 8000
- ✅ Next.js running on port 3000
- ✅ IBM Bob client wrapper
- ✅ GitHub API client
- ✅ Basic UI components

#### Hour 4-6: Orchestrator Agent

**Backend**:
```python
# backend/agents/orchestrator.py
from typing import Dict, Any, List
from enum import Enum

class AgentType(Enum):
    CODE_REVIEW = "code_review"
    DEV_FLOW = "dev_flow"
    LEGACY_CODE = "legacy_code"

class OrchestratorAgent:
    def __init__(self, bob_client):
        self.bob_client = bob_client
        self.agents = {}
    
    def route_request(self, request: Dict[str, Any]) -> AgentType:
        """Route request to appropriate agent"""
        feature = request.get("feature")
        if feature == "pr_review":
            return AgentType.CODE_REVIEW
        elif feature == "workflow":
            return AgentType.DEV_FLOW
        elif feature == "explore":
            return AgentType.LEGACY_CODE
        raise ValueError(f"Unknown feature: {feature}")
    
    async def execute(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Execute request through appropriate agent"""
        agent_type = self.route_request(request)
        agent = self.agents.get(agent_type)
        return await agent.execute(request)
```

**Deliverables**:
- ✅ Orchestrator agent implementation
- ✅ Agent routing logic
- ✅ Base agent class

#### Hour 6-8: Database & Models

**Backend**:
```python
# backend/models/database.py
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True)
    type = Column(String)  # pr_review, workflow, explore
    input_data = Column(JSON)
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class KnowledgeGraph(Base):
    __tablename__ = "knowledge_graphs"
    
    id = Column(Integer, primary_key=True)
    repo_url = Column(String)
    nodes = Column(JSON)
    edges = Column(JSON)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create engine
engine = create_engine("sqlite:///./devtools.db")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
```

**Deliverables**:
- ✅ SQLite database setup
- ✅ Data models defined
- ✅ Database migrations

#### Hour 8-12: Frontend Core Components

**Components to Build**:

1. **Header Component**
```tsx
// packages/web/components/header.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-8 font-bold text-xl">DevTools AI</div>
        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">🥇 Code Review</TabsTrigger>
            <TabsTrigger value="workflow">🥈 DevFlow</TabsTrigger>
            <TabsTrigger value="explore">🥉 Legacy Code</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  )
}
```

2. **Sidebar Component**
```tsx
// packages/web/components/sidebar.tsx
export function Sidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <nav className="space-y-2">
        <button className="w-full text-left p-2 hover:bg-accent rounded">
          📁 Files
        </button>
        <button className="w-full text-left p-2 hover:bg-accent rounded">
          🔍 Search
        </button>
        <button className="w-full text-left p-2 hover:bg-accent rounded">
          🤖 Agents
        </button>
      </nav>
    </aside>
  )
}
```

3. **Main Layout**
```tsx
// packages/web/components/main-layout.tsx
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ChatPanel } from "./chat-panel"

export function MainLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <ChatPanel />
    </div>
  )
}
```

**Deliverables**:
- ✅ Header with feature tabs
- ✅ Sidebar navigation
- ✅ Main layout structure
- ✅ Theme toggle
- ✅ Responsive design

---

### Phase 2: CodeReview Copilot (Hours 12-24)

#### Hour 12-14: PR Fetcher Agent

**Backend**:
```python
# backend/agents/code_review/pr_fetcher.py
class PRFetcherAgent:
    def __init__(self, github_client):
        self.github = github_client
    
    async def fetch_pr(self, pr_url: str) -> Dict[str, Any]:
        """Fetch PR data from GitHub"""
        # Parse URL
        owner, repo, pr_number = self.parse_pr_url(pr_url)
        
        # Fetch PR data
        pr_data = await self.github.fetch_pr(owner, repo, pr_number)
        
        # Fetch diff
        diff = await self.github.fetch_pr_diff(owner, repo, pr_number)
        
        # Fetch files
        files = await self.github.fetch_pr_files(owner, repo, pr_number)
        
        return {
            "pr_data": pr_data,
            "diff": diff,
            "files": files,
            "metadata": {
                "owner": owner,
                "repo": repo,
                "pr_number": pr_number
            }
        }
```

**API Endpoint**:
```python
# backend/api/code_review.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/code-review", tags=["code-review"])

class PRReviewRequest(BaseModel):
    pr_url: str

@router.post("/analyze")
async def analyze_pr(request: PRReviewRequest):
    try:
        # Fetch PR
        pr_fetcher = PRFetcherAgent(github_client)
        pr_data = await pr_fetcher.fetch_pr(request.pr_url)
        
        return {"status": "success", "data": pr_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Deliverables**:
- ✅ PR Fetcher Agent
- ✅ GitHub API integration
- ✅ API endpoint for PR analysis

#### Hour 14-18: Code Analyzer Agent (IBM Bob)

**Backend**:
```python
# backend/agents/code_review/code_analyzer.py
class CodeAnalyzerAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def analyze_with_context(
        self, 
        diff: str, 
        repo_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze code changes with full repo context"""
        
        # Prepare prompt for IBM Bob
        prompt = f"""
        Analyze this Pull Request diff in the context of the full repository.
        
        Repository Context:
        {repo_context}
        
        PR Diff:
        {diff}
        
        Identify:
        1. Potential bugs
        2. Security vulnerabilities
        3. Code smells
        4. Breaking changes
        5. Performance issues
        6. Naming convention violations
        
        For each issue, provide:
        - Severity (Critical/Warning/Info)
        - Line number
        - Description
        - Suggested fix
        """
        
        # Call IBM Bob
        analysis = await self.bob.analyze(prompt, repo_context)
        
        # Parse and structure results
        return self.parse_analysis(analysis)
    
    def parse_analysis(self, raw_analysis: str) -> Dict[str, Any]:
        """Parse IBM Bob response into structured format"""
        # Parse and categorize issues
        issues = []
        # ... parsing logic
        return {
            "issues": issues,
            "summary": {
                "critical": len([i for i in issues if i["severity"] == "Critical"]),
                "warning": len([i for i in issues if i["severity"] == "Warning"]),
                "info": len([i for i in issues if i["severity"] == "Info"])
            }
        }
```

**Deliverables**:
- ✅ Code Analyzer Agent with IBM Bob
- ✅ Prompt engineering for code analysis
- ✅ Issue parsing and categorization

#### Hour 18-20: Impact Graph Agent

**Backend**:
```python
# backend/agents/code_review/impact_graph.py
import networkx as nx

class ImpactGraphAgent:
    def build_dependency_graph(self, repo_files: List[Dict]) -> nx.DiGraph:
        """Build dependency graph from repository files"""
        G = nx.DiGraph()
        
        for file in repo_files:
            # Add file as node
            G.add_node(file["path"], type="file", **file)
            
            # Parse imports/dependencies
            dependencies = self.parse_dependencies(file["content"])
            
            # Add edges
            for dep in dependencies:
                G.add_edge(file["path"], dep)
        
        return G
    
    def calculate_impact(
        self, 
        changed_files: List[str], 
        graph: nx.DiGraph
    ) -> Dict[str, Any]:
        """Calculate impact radius of changes"""
        affected_files = set()
        
        for file in changed_files:
            # Find all files that depend on this file
            descendants = nx.descendants(graph, file)
            affected_files.update(descendants)
        
        return {
            "changed_files": changed_files,
            "affected_files": list(affected_files),
            "impact_score": len(affected_files),
            "graph_data": self.export_for_visualization(graph, changed_files, affected_files)
        }
    
    def export_for_visualization(
        self, 
        graph: nx.DiGraph, 
        changed: List[str], 
        affected: List[str]
    ) -> Dict[str, Any]:
        """Export graph data for Sigma.js visualization"""
        nodes = []
        edges = []
        
        for node in graph.nodes():
            nodes.append({
                "id": node,
                "label": node.split("/")[-1],
                "size": graph.degree(node),
                "color": self.get_node_color(node, changed, affected)
            })
        
        for edge in graph.edges():
            edges.append({
                "source": edge[0],
                "target": edge[1]
            })
        
        return {"nodes": nodes, "edges": edges}
```

**Frontend - Graph Visualization**:
```tsx
// packages/web/components/impact-graph.tsx
"use client"

import { useEffect, useRef } from "react"
import Sigma from "sigma"
import Graph from "graphology"

export function ImpactGraph({ data }) {
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!data || !containerRef.current) return
    
    const graph = new Graph()
    
    // Add nodes
    data.nodes.forEach(node => {
      graph.addNode(node.id, node)
    })
    
    // Add edges
    data.edges.forEach(edge => {
      graph.addEdge(edge.source, edge.target)
    })
    
    // Render with Sigma
    const renderer = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
    })
    
    return () => renderer.kill()
  }, [data])
  
  return (
    <div ref={containerRef} className="w-full h-[600px] border rounded-lg" />
  )
}
```

**Deliverables**:
- ✅ Impact Graph Agent
- ✅ Dependency graph builder
- ✅ Sigma.js visualization
- ✅ Interactive graph UI

#### Hour 20-24: Review Generator & UI

**Backend**:
```python
# backend/agents/code_review/review_generator.py
class ReviewGeneratorAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def generate_comments(
        self, 
        analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate human-readable review comments"""
        
        prompt = f"""
        Generate professional code review comments based on this analysis:
        {analysis}
        
        Format each comment as GitHub markdown with:
        - Severity label (🔴 Critical / ⚠️ Warning / ℹ️ Info)
        - Clear description
        - Code suggestion if applicable
        - Actionable next steps
        """
        
        comments = await self.bob.analyze(prompt, analysis)
        return self.format_for_github(comments)
```

**Frontend - Review Panel**:
```tsx
// packages/web/app/code-review/page.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImpactGraph } from "@/components/impact-graph"

export default function CodeReviewPage() {
  const [prUrl, setPrUrl] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const analyzePR = async () => {
    setLoading(true)
    const response = await fetch("/api/code-review/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pr_url: prUrl })
    })
    const data = await response.json()
    setAnalysis(data)
    setLoading(false)
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">🥇 Code Review Copilot</h1>
      
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <Input 
            placeholder="Enter GitHub PR URL..."
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
          />
          <Button onClick={analyzePR} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze PR"}
          </Button>
        </div>
      </Card>
      
      {analysis && (
        <>
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Impact Graph</h2>
            <ImpactGraph data={analysis.impact_graph} />
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Review Comments</h2>
            {analysis.comments.map((comment, i) => (
              <div key={i} className="mb-4 p-4 border rounded">
                <div className="font-semibold">{comment.severity}</div>
                <div className="mt-2">{comment.description}</div>
                {comment.suggestion && (
                  <pre className="mt-2 p-2 bg-muted rounded">
                    {comment.suggestion}
                  </pre>
                )}
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  )
}
```

**Deliverables**:
- ✅ Review Generator Agent
- ✅ GitHub-formatted comments
- ✅ Complete PR review UI
- ✅ Export to GitHub functionality

---

### Phase 3: LegacyCode Explainer (Hours 24-36)

#### Hour 24-28: Repository Indexer & Knowledge Graph

**Backend**:
```python
# backend/agents/legacy_code/repository_indexer.py
import os
import git
from pathlib import Path

class RepositoryIndexerAgent:
    async def clone_repository(self, repo_url: str) -> str:
        """Clone repository to temp directory"""
        repo_dir = f"/tmp/repos/{hash(repo_url)}"
        if not os.path.exists(repo_dir):
            git.Repo.clone_from(repo_url, repo_dir)
        return repo_dir
    
    async def scan_files(self, repo_dir: str) -> List[Dict[str, Any]]:
        """Scan all source files in repository"""
        files = []
        for path in Path(repo_dir).rglob("*"):
            if path.is_file() and self.is_source_file(path):
                files.append({
                    "path": str(path.relative_to(repo_dir)),
                    "content": path.read_text(errors="ignore"),
                    "size": path.stat().st_size,
                    "extension": path.suffix
                })
        return files
    
    def parse_code_structure(self, file: Dict[str, Any]) -> Dict[str, Any]:
        """Parse code structure (classes, functions, imports)"""
        # Use tree-sitter or ast for parsing
        pass

# backend/agents/legacy_code/knowledge_graph_builder.py
class KnowledgeGraphBuilderAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def build_graph(
        self, 
        files: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build knowledge graph from repository files"""
        
        # Create nodes for files, classes, functions
        nodes = []
        edges = []
        
        for file in files:
            # Parse structure
            structure = self.parse_structure(file)
            
            # Create file node
            nodes.append({
                "id": file["path"],
                "type": "file",
                "label": file["path"].split("/")[-1],
                "data": structure
            })
            
            # Create nodes for classes/functions
            for cls in structure.get("classes", []):
                node_id = f"{file['path']}::{cls['name']}"
                nodes.append({
                    "id": node_id,
                    "type": "class",
                    "label": cls["name"],
                    "parent": file["path"]
                })
                edges.append({
                    "source": file["path"],
                    "target": node_id,
                    "type": "contains"
                })
        
        # Use IBM Bob to enhance graph with insights
        enhanced_graph = await self.enhance_with_bob(nodes, edges)
        
        return enhanced_graph
```

**Deliverables**:
- ✅ Repository Indexer Agent
- ✅ Knowledge Graph Builder Agent
- ✅ Code structure parsing
- ✅ Graph storage in SQLite

#### Hour 28-32: Code Comprehension & RAG Chat

**Backend**:
```python
# backend/agents/legacy_code/code_comprehension.py
class CodeComprehensionAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def analyze_architecture(
        self, 
        repo_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze overall architecture using IBM Bob"""
        
        prompt = f"""
        Analyze this codebase and explain:
        
        Repository: {repo_data['name']}
        Files: {len(repo_data['files'])}
        
        Provide:
        1. Overall architecture pattern
        2. Key components and their roles
        3. Design patterns used
        4. Data flow
        5. Critical dependencies
        """
        
        analysis = await self.bob.analyze(prompt, repo_data)
        return self.structure_analysis(analysis)

# backend/agents/legacy_code/rag_chat.py
class RAGChatAgent:
    def __init__(self, bob_client, graph_db):
        self.bob = bob_client
        self.graph_db = graph_db
    
    async def process_question(
        self, 
        question: str, 
        repo_id: str
    ) -> Dict[str, Any]:
        """Process user question with RAG"""
        
        # Retrieve relevant context from knowledge graph
        context = await self.retrieve_context(question, repo_id)
        
        # Generate answer with IBM Bob
        prompt = f"""
        User asks: "{question}"
        
        Based on this codebase context:
        {context}
        
        Provide a detailed answer with:
        1. Direct answer
        2. Code examples
        3. Related components
        4. References to specific files/functions
        """
        
        answer = await self.bob.analyze(prompt, context)
        
        return {
            "question": question,
            "answer": answer,
            "context": context,
            "references": self.extract_references(answer)
        }
```

**Frontend - Knowledge Graph + Chat**:
```tsx
// packages/web/app/legacy-code/page.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { ChatInterface } from "@/components/chat-interface"

export default function LegacyCodePage() {
  const [repoUrl, setRepoUrl] = useState("")
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const analyzeRepo = async () => {
    setLoading(true)
    const response = await fetch("/api/legacy-code/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_url: repoUrl })
    })
    const data = await response.json()
    setGraph(data)
    setLoading(false)
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-8 border-b">
        <h1 className="text-3xl font-bold mb-4">🥉 Legacy Code Explainer</h1>
        <div className="flex gap-4">
          <Input 
            placeholder="Enter GitHub repository URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <Button onClick={analyzeRepo} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Repository"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8">
          {graph && <KnowledgeGraph data={graph} />}
        </div>
        <div className="w-96 border-l">
          <ChatInterface repoId={graph?.id} />
        </div>
      </div>
    </div>
  )
}
```

**Deliverables**:
- ✅ Code Comprehension Agent
- ✅ RAG Chat Agent
- ✅ Knowledge graph visualization
- ✅ Chat interface

#### Hour 32-36: Wiki Generator & Danger Zones

**Backend**:
```python
# backend/agents/legacy_code/wiki_generator.py
class WikiGeneratorAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def generate_module_docs(
        self, 
        module: Dict[str, Any]
    ) -> str:
        """Generate documentation for a module"""
        
        prompt = f"""
        Generate comprehensive documentation for this module:
        
        Module: {module['name']}
        Files: {module['files']}
        
        Include:
        1. Overview
        2. Key components
        3. Usage examples
        4. API reference
        5. Dependencies
        """
        
        docs = await self.bob.analyze(prompt, module)
        return self.format_as_markdown(docs)

# backend/agents/legacy_code/danger_zone_detector.py
class DangerZoneDetectorAgent:
    async def find_untested_code(
        self, 
        repo_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Find functions without tests"""
        untested = []
        
        for file in repo_data['files']:
            functions = file.get('functions', [])
            test_file = self.find_test_file(file['path'], repo_data)
            
            if not test_file:
                untested.extend(functions)
        
        return untested
    
    def calculate_complexity(self, function: Dict[str, Any]) -> int:
        """Calculate cyclomatic complexity"""
        # Use radon or similar tool
        pass
```

**Deliverables**:
- ✅ Wiki Generator Agent
- ✅ Danger Zone Detector Agent
- ✅ Auto-generated documentation
- ✅ Risk highlighting

---

### Phase 4: DevFlow Automator (Hours 36-44)

#### Hour 36-40: Git History Analyzer & Test Generator

**Backend**:
```python
# backend/agents/devflow/git_history_analyzer.py
import git

class GitHistoryAnalyzerAgent:
    def parse_git_log(self, repo_path: str) -> List[Dict[str, Any]]:
        """Parse git log and extract patterns"""
        repo = git.Repo(repo_path)
        commits = []
        
        for commit in repo.iter_commits(max_count=100):
            commits.append({
                "hash": commit.hexsha,
                "author": commit.author.name,
                "date": commit.committed_datetime,
                "message": commit.message,
                "files": [item.a_path for item in commit.diff(commit.parents[0])]
            })
        
        return commits
    
    def detect_patterns(self, commits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect work patterns"""
        # Analyze commit frequency, file hotspots, etc.
        pass

# backend/agents/devflow/test_generator.py
class TestGeneratorAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def generate_tests(
        self, 
        function: Dict[str, Any]
    ) -> str:
        """Generate unit tests for a function"""
        
        prompt = f"""
        Generate comprehensive unit tests for this function:
        
        {function['code']}
        
        Include:
        1. Happy path tests
        2. Edge cases
        3. Error handling
        4. Mock external dependencies
        
        Use {function['framework']} syntax.
        """
        
        tests = await self.bob.analyze(prompt, function)
        return tests
```

**Deliverables**:
- ✅ Git History Analyzer Agent
- ✅ Test Generator Agent
- ✅ Pattern detection
- ✅ Auto-generated tests

#### Hour 40-44: Documentation & Changelog Agents + UI

**Backend**:
```python
# backend/agents/devflow/documentation_agent.py
class DocumentationAgent:
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def generate_docstring(
        self, 
        function: Dict[str, Any]
    ) -> str:
        """Generate docstring for function"""
        
        prompt = f"""
        Generate comprehensive docstring for:
        
        {function['code']}
        
        Include: description, parameters, return value, examples, exceptions
        """
        
        docstring = await self.bob.analyze(prompt, function)
        return docstring

# backend/agents/devflow/changelog_agent.py
class ChangelogAgent:
    def parse_commits(
        self, 
        commits: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict]]:
        """Categorize commits by type"""
        categories = {
            "feat": [],
            "fix": [],
            "docs": [],
            "refactor": [],
            "test": []
        }
        
        for commit in commits:
            category = self.detect_category(commit['message'])
            categories[category].append(commit)
        
        return categories
    
    def generate_changelog(
        self, 
        categories: Dict[str, List[Dict]]
    ) -> str:
        """Generate CHANGELOG.md"""
        # Format as Keep a Changelog
        pass
```

**Frontend - DevFlow Dashboard**:
```tsx
// packages/web/app/devflow/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DevFlowPage() {
  const [analytics, setAnalytics] = useState(null)
  
  const runAutomation = async (type: string) => {
    const response = await fetch(`/api/devflow/${type}`, {
      method: "POST"
    })
    const data = await response.json()
    // Handle response
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">🥈 DevFlow Automator</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => runAutomation("generate-tests")}
            >
              🧪 Generate Tests
            </Button>
            <Button 
              className="w-full"
              onClick={() => runAutomation("update-docs")}
            >
              📝 Update Documentation
            </Button>
            <Button 
              className="w-full"
              onClick={() => runAutomation("generate-changelog")}
            >
              📋 Generate Changelog
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Time Saved This Week</h3>
          <div className="text-4xl font-bold text-green-600">
            3.2 hours
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            ↑ 15% from last week
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="analytics">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            {/* Analytics charts */}
          </TabsContent>
          <TabsContent value="history">
            {/* Git history visualization */}
          </TabsContent>
          <TabsContent value="patterns">
            {/* Work patterns analysis */}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
```

**Deliverables**:
- ✅ Documentation Agent
- ✅ Changelog Agent
- ✅ Analytics Agent
- ✅ DevFlow dashboard UI
- ✅ One-click automation

---

### Phase 5: Integration & Polish (Hours 44-48)

#### Hour 44-46: Integration & Testing

**Tasks**:
1. Unified navigation between features
2. Shared state management
3. IBM Bob session management
4. Error handling & loading states
5. API error recovery
6. Cross-feature data sharing

**Testing**:
```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd packages/web
npm run test
```

**Deliverables**:
- ✅ All features integrated
- ✅ Smooth navigation
- ✅ Error handling
- ✅ Unit tests passing

#### Hour 46-47: Documentation & Demo

**Create**:
1. **README.md** with:
   - Project overview
   - Setup instructions
   - Demo video/GIF
   - Architecture diagram
   - API documentation

2. **IBM_BOB_REPORT.md**:
   - Session logs
   - Token usage
   - Analysis examples
   - Prompt templates used

3. **Demo Video** (2-3 minutes):
   - Show all three features
   - Highlight IBM Bob integration
   - Show visual outputs

**Deliverables**:
- ✅ Complete README
- ✅ IBM Bob session export
- ✅ Demo video
- ✅ API documentation

#### Hour 47-48: Deployment & Submission

**Deploy**:
```bash
# Frontend to Vercel
cd packages/web
vercel deploy --prod

# Backend to Railway
cd backend
railway up
```

**Final Checklist**:
- ✅ Public GitHub repository
- ✅ Live demo URL
- ✅ README with setup
- ✅ IBM Bob session logs
- ✅ Demo video
- ✅ All features working
- ✅ Mobile responsive
- ✅ Error handling
- ✅ Loading states
- ✅ Clean code
- ✅ Submission form completed

---

## 🎯 Success Criteria

### Technical
- [ ] All 3 features functional
- [ ] IBM Bob integrated in all agents
- [ ] GitNexus-style visualizations
- [ ] Responsive UI
- [ ] < 2s API response time
- [ ] Error handling complete

### Hackathon
- [ ] Demo-ready in 48 hours
- [ ] Visual WOW factor
- [ ] Clear IBM Bob usage
- [ ] Real problem solved
- [ ] Professional presentation

## 📚 Resources

- Next.js Docs: https://nextjs.org/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Sigma.js Docs: https://www.sigmajs.org
- shadcn/ui: https://ui.shadcn.com
- IBM Bob API: [To be added]

---

**Created**: 2026-05-16  
**Status**: Ready to Execute  
**Estimated Completion**: 48 hours