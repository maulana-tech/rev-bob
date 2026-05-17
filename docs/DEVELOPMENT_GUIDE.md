# DevTools AI Suite - Complete Development Guide

## 🎯 Overview

This guide provides step-by-step instructions to complete all development phases for the DevTools AI Suite hackathon project.

**Current Status**: Phase 1 Complete (30%)  
**Remaining**: Phases 2-5 (70%)  
**Timeline**: 36 hours remaining

---

## 📋 Phase Breakdown

### ✅ Phase 1: Foundation (0-12h) - COMPLETE
- [x] Project structure
- [x] Backend API setup
- [x] IBM Bob client
- [x] GitHub client
- [x] Database models
- [x] Orchestrator Agent
- [x] Documentation

### 🔄 Phase 2: CodeReview Copilot (12-24h) - NEXT
- [ ] PR Fetcher Agent
- [ ] Code Analyzer Agent
- [ ] Impact Graph Agent
- [ ] Review Generator Agent
- [ ] Frontend: PR input & results display
- [ ] Graph visualization

### ⏳ Phase 3: LegacyCode Explainer (24-36h)
- [ ] Repository Indexer Agent
- [ ] Knowledge Graph Builder Agent
- [ ] Code Comprehension Agent
- [ ] RAG Chat Agent
- [ ] Wiki Generator Agent
- [ ] Danger Zone Detector Agent
- [ ] Frontend: Graph & chat interface

### ⏳ Phase 4: DevFlow Automator (36-44h)
- [ ] Git History Analyzer Agent
- [ ] Test Generator Agent
- [ ] Documentation Agent
- [ ] Changelog Agent
- [ ] Analytics Agent
- [ ] Frontend: Dashboard & automation UI

### ⏳ Phase 5: Integration & Polish (44-48h)
- [ ] Integration testing
- [ ] UI/UX polish
- [ ] Error handling
- [ ] Demo video
- [ ] Deployment
- [ ] Submission

---

## 🚀 Phase 2: CodeReview Copilot (Hours 12-24)

### Step 1: PR Fetcher Agent (2 hours)

**File**: `backend/agents/code_review/pr_fetcher.py`

```python
"""
PR Fetcher Agent
Fetches and parses GitHub PR data
"""

from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class PRFetcherAgent:
    """Fetch and parse GitHub PR data"""
    
    def __init__(self, github_client):
        self.github = github_client
    
    async def fetch_pr(self, pr_url: str) -> Dict[str, Any]:
        """
        Fetch complete PR data
        
        Args:
            pr_url: GitHub PR URL
            
        Returns:
            Complete PR data with diff, files, commits
        """
        try:
            # Parse URL
            owner, repo, pr_number = self.github.parse_pr_url(pr_url)
            
            # Fetch PR data
            pr_data = await self.github.fetch_pr(owner, repo, pr_number)
            
            # Fetch diff
            diff = await self.github.fetch_pr_diff(owner, repo, pr_number)
            
            # Fetch files
            files = await self.github.fetch_pr_files(owner, repo, pr_number)
            
            # Fetch commits
            commits = await self.github.fetch_pr_commits(owner, repo, pr_number)
            
            # Fetch repository context (for full analysis)
            repo_info = await self.github.fetch_repository_info(owner, repo)
            repo_tree = await self.github.fetch_repository_tree(owner, repo)
            
            return {
                "pr_data": pr_data,
                "diff": diff,
                "files": files,
                "commits": commits,
                "repo_info": repo_info,
                "repo_tree": repo_tree,
                "metadata": {
                    "owner": owner,
                    "repo": repo,
                    "pr_number": pr_number
                }
            }
            
        except Exception as e:
            logger.error(f"Error fetching PR: {str(e)}")
            raise
```

**Create file**:
```bash
mkdir -p backend/agents/code_review
touch backend/agents/code_review/__init__.py
# Then create pr_fetcher.py with above code
```

### Step 2: Code Analyzer Agent (3 hours)

**File**: `backend/agents/code_review/code_analyzer.py`

```python
"""
Code Analyzer Agent
Deep code analysis using IBM Bob
"""

from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class CodeAnalyzerAgent:
    """Analyze code with IBM Bob"""
    
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def analyze_with_context(
        self, 
        diff: str, 
        repo_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze PR diff with full repository context
        
        Args:
            diff: PR diff string
            repo_context: Repository context data
            
        Returns:
            Structured analysis results
        """
        try:
            # Build comprehensive prompt
            prompt = self._build_analysis_prompt(diff, repo_context)
            
            # Call IBM Bob
            response = await self.bob.analyze(prompt, {
                "diff": diff,
                "repo": repo_context
            })
            
            # Parse response
            analysis = self._parse_analysis(response)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing code: {str(e)}")
            raise
    
    def _build_analysis_prompt(self, diff: str, repo_context: Dict) -> str:
        """Build comprehensive analysis prompt"""
        return f"""
        Analyze this Pull Request diff in the context of the full repository.
        
        Repository: {repo_context.get('name')}
        Language: {repo_context.get('language')}
        Total Files: {len(repo_context.get('tree', []))}
        
        PR Diff:
        {diff}
        
        Identify and categorize:
        1. **Potential Bugs**
           - Logic errors
           - Null pointer issues
           - Off-by-one errors
           - Resource leaks
        
        2. **Security Vulnerabilities**
           - SQL injection
           - XSS vulnerabilities
           - Authentication issues
           - Data exposure
        
        3. **Code Smells**
           - Duplicated code
           - Long methods
           - Large classes
           - Dead code
        
        4. **Breaking Changes**
           - API changes
           - Signature changes
           - Removed functionality
        
        5. **Performance Issues**
           - Inefficient algorithms
           - Memory leaks
           - N+1 queries
        
        For each issue, provide:
        - **Severity**: Critical / Warning / Info
        - **Line Number**: Exact line in diff
        - **File**: File path
        - **Description**: Clear explanation
        - **Suggestion**: How to fix
        - **Code Fix**: Suggested code (if applicable)
        
        Format as JSON array of issues.
        """
    
    def _parse_analysis(self, response: str) -> Dict[str, Any]:
        """Parse IBM Bob response into structured format"""
        # TODO: Implement proper JSON parsing
        # For now, return structured format
        
        issues = []
        # Parse response and extract issues
        
        return {
            "issues": issues,
            "summary": {
                "critical": len([i for i in issues if i.get("severity") == "Critical"]),
                "warning": len([i for i in issues if i.get("severity") == "Warning"]),
                "info": len([i for i in issues if i.get("severity") == "Info"]),
                "total": len(issues)
            },
            "raw_response": response
        }
```

### Step 3: Impact Graph Agent (2 hours)

**File**: `backend/agents/code_review/impact_graph.py`

```python
"""
Impact Graph Agent
Generate visual impact graph of code changes
"""

import networkx as nx
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class ImpactGraphAgent:
    """Build dependency graph and calculate impact"""
    
    def build_dependency_graph(self, repo_files: List[Dict]) -> nx.DiGraph:
        """
        Build dependency graph from repository files
        
        Args:
            repo_files: List of file data
            
        Returns:
            NetworkX directed graph
        """
        G = nx.DiGraph()
        
        for file in repo_files:
            # Add file as node
            G.add_node(
                file["path"],
                type="file",
                size=file.get("size", 0),
                language=file.get("language", "unknown")
            )
            
            # Parse dependencies (imports, requires, etc.)
            dependencies = self._parse_dependencies(file)
            
            # Add edges for dependencies
            for dep in dependencies:
                if dep in [f["path"] for f in repo_files]:
                    G.add_edge(file["path"], dep, type="dependency")
        
        return G
    
    def calculate_impact(
        self, 
        changed_files: List[str], 
        graph: nx.DiGraph
    ) -> Dict[str, Any]:
        """
        Calculate impact radius of changes
        
        Args:
            changed_files: List of changed file paths
            graph: Dependency graph
            
        Returns:
            Impact analysis with affected files
        """
        affected_files = set()
        impact_scores = {}
        
        for file in changed_files:
            if file not in graph:
                continue
            
            # Find all files that depend on this file (descendants)
            descendants = nx.descendants(graph, file)
            affected_files.update(descendants)
            
            # Calculate impact score (number of affected files)
            impact_scores[file] = len(descendants)
        
        return {
            "changed_files": changed_files,
            "affected_files": list(affected_files),
            "impact_scores": impact_scores,
            "total_impact": len(affected_files),
            "graph_data": self._export_for_visualization(
                graph, 
                changed_files, 
                affected_files
            )
        }
    
    def _parse_dependencies(self, file: Dict) -> List[str]:
        """Parse file dependencies from content"""
        # TODO: Implement actual parsing based on language
        # For now, return empty list
        return []
    
    def _export_for_visualization(
        self, 
        graph: nx.DiGraph, 
        changed: List[str], 
        affected: List[str]
    ) -> Dict[str, Any]:
        """
        Export graph data for Sigma.js visualization
        
        Returns:
            Graph data in Sigma.js format
        """
        nodes = []
        edges = []
        
        for node in graph.nodes():
            color = "#ff0000" if node in changed else \
                    "#ff9900" if node in affected else \
                    "#cccccc"
            
            nodes.append({
                "id": node,
                "label": node.split("/")[-1],  # Just filename
                "size": graph.degree(node) + 5,
                "color": color,
                "x": 0,  # Will be positioned by layout algorithm
                "y": 0
            })
        
        for edge in graph.edges():
            edges.append({
                "id": f"{edge[0]}-{edge[1]}",
                "source": edge[0],
                "target": edge[1],
                "size": 1
            })
        
        return {
            "nodes": nodes,
            "edges": edges
        }
```

### Step 4: Review Generator Agent (2 hours)

**File**: `backend/agents/code_review/review_generator.py`

```python
"""
Review Generator Agent
Generate human-readable review comments
"""

from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class ReviewGeneratorAgent:
    """Generate review comments from analysis"""
    
    def __init__(self, bob_client):
        self.bob = bob_client
    
    async def generate_comments(
        self, 
        analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate review comments from analysis
        
        Args:
            analysis: Analysis results from CodeAnalyzerAgent
            
        Returns:
            List of formatted review comments
        """
        try:
            # Build prompt for comment generation
            prompt = self._build_comment_prompt(analysis)
            
            # Call IBM Bob
            response = await self.bob.analyze(prompt, analysis)
            
            # Parse and format comments
            comments = self._parse_comments(response, analysis)
            
            return comments
            
        except Exception as e:
            logger.error(f"Error generating comments: {str(e)}")
            raise
    
    def _build_comment_prompt(self, analysis: Dict[str, Any]) -> str:
        """Build prompt for comment generation"""
        return f"""
        Generate professional code review comments based on this analysis.
        
        Analysis Summary:
        - Critical Issues: {analysis['summary']['critical']}
        - Warnings: {analysis['summary']['warning']}
        - Info: {analysis['summary']['info']}
        
        Issues Found:
        {self._format_issues_for_prompt(analysis['issues'])}
        
        For each issue, generate a comment with:
        1. **Severity Label**: 🔴 Critical / ⚠️ Warning / ℹ️ Info
        2. **Clear Description**: Explain the issue
        3. **Code Suggestion**: Show how to fix (if applicable)
        4. **Actionable Steps**: What the developer should do
        
        Format as GitHub markdown.
        Be professional, constructive, and helpful.
        """
    
    def _format_issues_for_prompt(self, issues: List[Dict]) -> str:
        """Format issues for prompt"""
        formatted = []
        for i, issue in enumerate(issues, 1):
            formatted.append(f"{i}. [{issue['severity']}] {issue['description']}")
        return "\n".join(formatted)
    
    def _parse_comments(
        self, 
        response: str, 
        analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Parse and format comments"""
        comments = []
        
        for issue in analysis.get("issues", []):
            comment = {
                "severity": issue.get("severity", "Info"),
                "file": issue.get("file", ""),
                "line": issue.get("line", 0),
                "description": issue.get("description", ""),
                "suggestion": issue.get("suggestion", ""),
                "code_fix": issue.get("code_fix", "")
            }
            comments.append(comment)
        
        return comments
    
    def format_for_github(self, comments: List[Dict[str, Any]]) -> str:
        """
        Format comments for GitHub
        
        Returns:
            Markdown formatted review
        """
        severity_icons = {
            "Critical": "🔴",
            "Warning": "⚠️",
            "Info": "ℹ️"
        }
        
        markdown = "# Code Review\n\n"
        markdown += "## Summary\n\n"
        
        # Group by severity
        by_severity = {}
        for comment in comments:
            severity = comment["severity"]
            if severity not in by_severity:
                by_severity[severity] = []
            by_severity[severity].append(comment)
        
        # Format each severity group
        for severity in ["Critical", "Warning", "Info"]:
            if severity in by_severity:
                icon = severity_icons[severity]
                markdown += f"\n### {icon} {severity} ({len(by_severity[severity])})\n\n"
                
                for comment in by_severity[severity]:
                    markdown += f"**{comment['file']}:{comment['line']}**\n\n"
                    markdown += f"{comment['description']}\n\n"
                    
                    if comment['suggestion']:
                        markdown += f"**Suggestion**: {comment['suggestion']}\n\n"
                    
                    if comment['code_fix']:
                        markdown += f"```\n{comment['code_fix']}\n```\n\n"
                    
                    markdown += "---\n\n"
        
        return markdown
```

### Step 5: Update Orchestrator (1 hour)

Update `backend/agents/orchestrator.py` to use the new agents:

```python
# Add imports at top
from .code_review.pr_fetcher import PRFetcherAgent
from .code_review.code_analyzer import CodeAnalyzerAgent
from .code_review.impact_graph import ImpactGraphAgent
from .code_review.review_generator import ReviewGeneratorAgent

# Update _execute_code_review method
async def _execute_code_review(self, request: Dict[str, Any]) -> Dict[str, Any]:
    """Execute code review request"""
    logger.info("Executing code review request")
    
    # Initialize agents
    pr_fetcher = PRFetcherAgent(self.github_client)
    code_analyzer = CodeAnalyzerAgent(self.bob_client)
    impact_graph = ImpactGraphAgent()
    review_generator = ReviewGeneratorAgent(self.bob_client)
    
    # 1. Fetch PR
    pr_data = await pr_fetcher.fetch_pr(request["pr_url"])
    
    # 2. Analyze code
    analysis = await code_analyzer.analyze_with_context(
        pr_data["diff"],
        pr_data["repo_info"]
    )
    
    # 3. Build impact graph
    graph = impact_graph.build_dependency_graph(pr_data["repo_tree"])
    impact = impact_graph.calculate_impact(
        [f["filename"] for f in pr_data["files"]],
        graph
    )
    
    # 4. Generate review
    comments = await review_generator.generate_comments(analysis)
    github_review = review_generator.format_for_github(comments)
    
    return {
        "status": "success",
        "feature": "code_review",
        "result": {
            "pr_data": pr_data["pr_data"],
            "analysis": analysis,
            "impact_graph": impact["graph_data"],
            "comments": comments,
            "github_review": github_review
        }
    }
```

### Step 6: Frontend - PR Review UI (3 hours)

**Initialize Next.js** (if not done):
```bash
cd packages/web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @tanstack/react-query axios zustand
npm install sigma graphology
npm install shadcn-ui
```

**File**: `packages/web/app/code-review/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImpactGraph } from "@/components/impact-graph"
import { ReviewComments } from "@/components/review-comments"

export default function CodeReviewPage() {
  const [prUrl, setPrUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const analyzePR = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/code-review/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr_url: prUrl })
      })
      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">🥇 CodeReview Copilot</h1>
      
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="Enter GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={analyzePR} 
            disabled={loading || !prUrl}
            className="min-w-[120px]"
          >
            {loading ? "Analyzing..." : "Analyze PR"}
          </Button>
        </div>
      </Card>
      
      {result && (
        <Tabs defaultValue="graph" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="graph">Impact Graph</TabsTrigger>
            <TabsTrigger value="review">Review Comments</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="graph" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Impact Graph</h2>
              <ImpactGraph data={result.impact_graph} />
            </Card>
          </TabsContent>
          
          <TabsContent value="review" className="mt-6">
            <ReviewComments 
              comments={result.comments}
              summary={result.analysis.summary}
            />
          </TabsContent>
          
          <TabsContent value="export" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Export to GitHub</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {result.github_review}
              </pre>
              <Button className="mt-4">Copy to Clipboard</Button>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
```

### Step 7: Impact Graph Component (2 hours)

**File**: `packages/web/components/impact-graph.tsx`

```typescript
"use client"

import { useEffect, useRef } from "react"
import Sigma from "sigma"
import Graph from "graphology"

interface ImpactGraphProps {
  data: {
    nodes: Array<{
      id: string
      label: string
      size: number
      color: string
    }>
    edges: Array<{
      id: string
      source: string
      target: string
    }>
  }
}

export function ImpactGraph({ data }: ImpactGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  
  useEffect(() => {
    if (!data || !containerRef.current) return
    
    // Create graph
    const graph = new Graph()
    
    // Add nodes
    data.nodes.forEach(node => {
      graph.addNode(node.id, {
        label: node.label,
        size: node.size,
        color: node.color,
        x: Math.random(),
        y: Math.random()
      })
    })
    
    // Add edges
    data.edges.forEach(edge => {
      try {
        graph.addEdge(edge.source, edge.target, {
          size: 1
        })
      } catch (e) {
        // Edge might already exist
      }
    })
    
    // Create Sigma instance
    if (sigmaRef.current) {
      sigmaRef.current.kill()
    }
    
    sigmaRef.current = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultNodeColor: "#cccccc",
      defaultEdgeColor: "#999999"
    })
    
    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill()
      }
    }
  }, [data])
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] border rounded-lg bg-white"
    />
  )
}
```

---

## 📝 Testing Phase 2

### Test Backend
```bash
cd backend
pytest tests/test_code_review.py -v
```

### Test Frontend
```bash
cd packages/web
npm run dev
# Visit http://localhost:3000/code-review
```

### Manual Test
1. Enter a real GitHub PR URL
2. Click "Analyze PR"
3. Verify impact graph displays
4. Check review comments
5. Test export functionality

---

## 🎯 Success Criteria for Phase 2

- [ ] PR Fetcher Agent working
- [ ] Code Analyzer Agent using IBM Bob
- [ ] Impact Graph generated
- [ ] Review comments formatted
- [ ] Frontend displays results
- [ ] Graph visualization interactive
- [ ] Export to GitHub format works

---

## ⏭️ Next: Phase 3 (LegacyCode Explainer)

After completing Phase 2, continue with Phase 3 following similar pattern:
1. Implement agents
2. Update orchestrator
3. Build frontend
4. Test integration

**Estimated Time**: 12 hours  
**Key Deliverable**: Interactive knowledge graph with RAG chat

---

**Last Updated**: 2026-05-16  
**Status**: Phase 2 Ready to Start  
**Next Milestone**: CodeReview Copilot Complete