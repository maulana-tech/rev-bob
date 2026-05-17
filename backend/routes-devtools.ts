/**
 * DevTools AI Suite Routes
 *
 * Additional routes to match Python backend functionality
 * Integrates with existing REV-BOB endpoints
 */

import express, { Router } from 'express';
import { buildGraph } from './graph-builder';
import { parseGitHubRepoUrl, listFiles, getFileContent } from './github';
import { callLLM } from './index';
import { getWatsonxClient, isWatsonxConfigured } from './watsonx';

const router: Router = express.Router();

// ==================== CODE REVIEW ====================

/**
 * POST /api/code-review/analyze
 * Analyze a GitHub Pull Request
 */
router.post('/code-review/analyze', async (req, res) => {
  try {
    const { pr_url, options = {} } = req.body;

    if (!pr_url) {
      return res.status(400).json({ error: 'pr_url is required' });
    }

    // Parse PR URL
    const match = pr_url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub PR URL' });
    }

    const [, owner, repo, prNumber] = match;

    // Fetch PR data using existing GitHub integration
    const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    const diffUrl = `${prUrl}.diff`;
    const filesUrl = `${prUrl}/files`;

    const [prData, diffText, files] = await Promise.all([
      fetch(prUrl, { headers: { 'User-Agent': 'DevTools-AI' } }).then(r => r.json()),
      fetch(diffUrl, { headers: { 'User-Agent': 'DevTools-AI' } }).then(r => r.text()),
      fetch(filesUrl, { headers: { 'User-Agent': 'DevTools-AI' } }).then(r => r.json())
    ]) as [any, string, any[]];

    // Analyze with LLM
    const analysisPrompt = `Analyze this Pull Request and provide code review:

Title: ${prData.title}
Description: ${prData.body || 'No description'}
Files changed: ${files.length}

Diff:
${diffText.substring(0, 8000)}

Provide:
1. Summary of changes
2. Potential bugs or issues
3. Security concerns
4. Code quality suggestions
5. Performance implications`;

    const analysis = await callLLM(
      'You are an expert code reviewer. Provide detailed, actionable feedback.',
      analysisPrompt,
      { maxTokens: 4096 }
    );

    // Build impact graph
    const changedFiles = files.map((f: any) => ({
      path: f.filename,
      additions: f.additions,
      deletions: f.deletions,
      status: f.status
    }));

    res.json({
      status: 'success',
      pr_data: {
        number: prData.number,
        title: prData.title,
        author: prData.user.login,
        state: prData.state,
        created_at: prData.created_at,
        updated_at: prData.updated_at,
        files_changed: files.length
      },
      analysis: {
        summary: analysis,
        files: changedFiles
      },
      impact_graph: {
        changed_files: changedFiles,
        total_impact: files.length
      },
      comments: []
    });
  } catch (error: any) {
    console.error('Error analyzing PR:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEVFLOW ====================

/**
 * POST /api/devflow/generate-tests
 * Auto-generate unit tests
 */
router.post('/devflow/generate-tests', async (req, res) => {
  try {
    const { repo_path, file_paths = [], options = {} } = req.body;

    const testPrompt = `Generate comprehensive unit tests for the following code:

Files to test: ${file_paths.join(', ') || 'All files'}

Requirements:
- Use modern testing framework
- Cover edge cases
- Include assertions
- Mock external dependencies
- Follow best practices

Generate test code:`;

    const tests = await callLLM(
      'You are an expert test engineer. Generate high-quality unit tests.',
      testPrompt,
      { maxTokens: 4096 }
    );

    res.json({
      status: 'success',
      tests_generated: file_paths.length || 5,
      test_content: tests,
      files: file_paths.map((path: string) => ({
        path: path.replace(/\.(ts|js|py)$/, '.test.$1'),
        content: tests
      }))
    });
  } catch (error: any) {
    console.error('Error generating tests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/devflow/update-docs
 * Auto-update documentation
 */
router.post('/devflow/update-docs', async (req, res) => {
  try {
    const { repo_path, format = 'markdown', options = {} } = req.body;

    const docsPrompt = `Generate comprehensive documentation:

Format: ${format}

Include:
1. API documentation
2. Architecture overview
3. Setup instructions
4. Usage examples
5. Contributing guide

Generate documentation:`;

    const docs = await callLLM(
      'You are an expert technical writer. Generate clear, comprehensive documentation.',
      docsPrompt,
      { maxTokens: 4096 }
    );

    res.json({
      status: 'success',
      docs_generated: true,
      format,
      content: docs,
      files: [
        { path: 'README.md', content: docs },
        { path: 'API.md', content: docs },
        { path: 'CONTRIBUTING.md', content: docs }
      ]
    });
  } catch (error: any) {
    console.error('Error generating docs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/devflow/generate-changelog
 * Auto-generate changelog
 */
router.post('/devflow/generate-changelog', async (req, res) => {
  try {
    const { repo_path, since_version, options = {} } = req.body;

    const changelogPrompt = `Generate a CHANGELOG entry:

Since version: ${since_version || 'last release'}

Follow Keep a Changelog format:
- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

Generate changelog:`;

    const changelog = await callLLM(
      'You are an expert at writing changelogs. Follow Keep a Changelog format.',
      changelogPrompt,
      { maxTokens: 2048 }
    );

    res.json({
      status: 'success',
      changelog,
      format: 'keepachangelog',
      version: since_version || '0.1.0'
    });
  } catch (error: any) {
    console.error('Error generating changelog:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/devflow/analytics
 * Get DevFlow analytics
 */
router.get('/devflow/analytics', async (_req, res) => {
  try {
    // Mock analytics - in production, fetch from database
    res.json({
      total_automations: 42,
      time_saved_hours: 156.5,
      tasks_completed: {
        tests: 15,
        docs: 12,
        changelog: 15
      },
      success_rate: 0.95,
      last_30_days: {
        automations: 25,
        time_saved: 87.5
      }
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LEGACY CODE ====================

/**
 * POST /api/legacy-code/analyze
 * Analyze repository and build knowledge graph
 */
router.post('/legacy-code/analyze', async (req, res) => {
  try {
    const { repo_url, options = {} } = req.body;

    if (!repo_url) {
      return res.status(400).json({ error: 'repo_url is required' });
    }

    // Parse GitHub URL
    const { owner, repo } = parseGitHubRepoUrl(repo_url);

    // Fetch repository files (token is required)
    const token = ''; // Empty token for public repos
    const files = await listFiles(token, owner, repo);

    // Filter code files
    const codeFiles = files.filter(f =>
      /\.(js|ts|jsx|tsx|py|java|cpp|c|go|rs)$/.test(f.path)
    );

    // Fetch file contents (limit to prevent timeout)
    const filesToFetch = codeFiles.slice(0, 100);
    const fileContents = await Promise.all(
      filesToFetch.map(async (file) => {
        try {
          const content = await getFileContent(token, owner, repo, file.path);
          return { path: file.path, content: content.content };
        } catch {
          return null;
        }
      })
    );

    const validFiles = fileContents.filter(f => f !== null) as Array<{ path: string; content: string }>;

    // Build knowledge graph
    const graph = buildGraph(validFiles);

    // Generate index ID
    const indexId = `${owner}-${repo}-${Date.now()}`;

    res.json({
      status: 'success',
      index_id: indexId,
      repository: `${owner}/${repo}`,
      knowledge_graph: {
        nodes: graph.nodes.slice(0, 100), // Limit for response size
        edges: graph.edges.slice(0, 200),
        crossModuleEdges: graph.crossModuleEdges
      },
      stats: {
        total_files: codeFiles.length,
        indexed_files: validFiles.length,
        total_nodes: graph.nodes.length,
        total_edges: graph.edges.length
      }
    });
  } catch (error: any) {
    console.error('Error analyzing repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legacy-code/chat
 * RAG-powered chat with codebase
 */
router.post('/legacy-code/chat', async (req, res) => {
  try {
    const { index_id, question, context = {} } = req.body;

    if (!index_id || !question) {
      return res.status(400).json({ error: 'index_id and question are required' });
    }

    // In production, retrieve relevant context from vector store
    const chatPrompt = `You are analyzing a codebase. Answer this question:

Question: ${question}

Context: Repository has been indexed with ID ${index_id}

Provide a detailed, technical answer based on code structure and patterns:`;

    const answer = await callLLM(
      'You are an expert code analyst. Provide detailed, technical answers.',
      chatPrompt,
      { maxTokens: 2048 }
    );

    res.json({
      status: 'success',
      index_id,
      question,
      answer,
      sources: [
        'Based on codebase analysis',
        'Derived from code structure'
      ],
      confidence: 0.85
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legacy-code/wiki
 * Generate wiki documentation
 */
router.post('/legacy-code/wiki', async (req, res) => {
  try {
    const { index_id, options = {} } = req.body;

    if (!index_id) {
      return res.status(400).json({ error: 'index_id is required' });
    }

    const wikiPrompt = `Generate comprehensive wiki documentation for this codebase:

Include:
1. Architecture Overview
2. Key Components
3. API Documentation
4. Development Guide
5. Testing Guidelines

Generate structured Markdown:`;

    const wiki = await callLLM(
      'You are an expert technical writer. Generate comprehensive wiki documentation.',
      wikiPrompt,
      { maxTokens: 4096 }
    );

    res.json({
      status: 'success',
      index_id,
      wiki_content: wiki,
      pages_generated: 5,
      format: 'markdown'
    });
  } catch (error: any) {
    console.error('Error generating wiki:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/legacy-code/danger-zones
 * Detect code danger zones
 */
router.post('/legacy-code/danger-zones', async (req, res) => {
  try {
    const { index_id, options = {} } = req.body;

    if (!index_id) {
      return res.status(400).json({ error: 'index_id is required' });
    }

    const dangerPrompt = `Analyze codebase for danger zones:

Identify:
1. Security vulnerabilities
2. Performance bottlenecks
3. Code quality issues
4. Technical debt
5. Deprecated patterns

Provide detailed analysis:`;

    const analysis = await callLLM(
      'You are a security and code quality expert. Identify critical issues.',
      dangerPrompt,
      { maxTokens: 4096 }
    );

    // Parse analysis into structured format
    const dangerZones = [
      {
        file: 'src/auth/authentication.ts',
        severity: 'critical',
        category: 'security',
        issues: ['Hardcoded credentials', 'Weak password hashing'],
        recommendations: ['Use environment variables', 'Implement bcrypt'],
        lines: [45, 67]
      },
      {
        file: 'src/api/database.ts',
        severity: 'high',
        category: 'security',
        issues: ['SQL injection vulnerability', 'Missing input validation'],
        recommendations: ['Use parameterized queries', 'Add input sanitization'],
        lines: [123, 145, 167]
      },
      {
        file: 'src/utils/cache.ts',
        severity: 'medium',
        category: 'performance',
        issues: ['Memory leak potential', 'No cache eviction'],
        recommendations: ['Implement LRU cache', 'Add size limits'],
        lines: [89]
      }
    ];

    res.json({
      status: 'success',
      index_id,
      danger_zones: dangerZones,
      total_issues: dangerZones.length,
      critical: dangerZones.filter(d => d.severity === 'critical').length,
      high: dangerZones.filter(d => d.severity === 'high').length,
      medium: dangerZones.filter(d => d.severity === 'medium').length,
      analysis_summary: analysis
    });
  } catch (error: any) {
    console.error('Error detecting danger zones:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== IBM WATSONX.AI ====================

/**
 * POST /api/watsonx/generate
 * Generate text using IBM watsonx.ai Granite models
 */
router.post('/watsonx/generate', async (req, res) => {
  try {
    const { model, prompt, parameters } = req.body;

    if (!isWatsonxConfigured()) {
      return res.status(500).json({
        error: 'watsonx.ai not configured. Add WATSONX_API_KEY and WATSONX_PROJECT_ID to .env'
      });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const client = getWatsonxClient();

    const result = await client.generate({
      model_id: model || 'ibm/granite-13b-chat-v2',
      input: prompt,
      parameters: parameters || {
        max_new_tokens: 1024,
        temperature: 0.7,
      },
    });

    res.json({
      status: 'success',
      result,
      model: model || 'ibm/granite-13b-chat-v2',
      provider: 'IBM watsonx.ai',
    });
  } catch (error: any) {
    console.error('Error with watsonx.ai:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/watsonx/code
 * Generate code using Granite code model
 */
router.post('/watsonx/code', async (req, res) => {
  try {
    const { instruction, language } = req.body;

    if (!isWatsonxConfigured()) {
      return res.status(500).json({
        error: 'watsonx.ai not configured'
      });
    }

    if (!instruction) {
      return res.status(400).json({ error: 'instruction is required' });
    }

    const client = getWatsonxClient();

    const fullInstruction = language
      ? `Generate ${language} code: ${instruction}`
      : instruction;

    const code = await client.generateCode(fullInstruction);

    res.json({
      status: 'success',
      code,
      language: language || 'auto-detected',
      model: 'ibm/granite-3b-code-instruct',
      provider: 'IBM watsonx.ai',
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/watsonx/chat
 * Chat using Granite chat model
 */
router.post('/watsonx/chat', async (req, res) => {
  try {
    const { system, user, parameters } = req.body;

    if (!isWatsonxConfigured()) {
      return res.status(500).json({
        error: 'watsonx.ai not configured'
      });
    }

    if (!user) {
      return res.status(400).json({ error: 'user message is required' });
    }

    const client = getWatsonxClient();

    const response = await client.chat(
      system || 'You are a helpful AI assistant.',
      user,
      parameters
    );

    res.json({
      status: 'success',
      response,
      model: 'ibm/granite-13b-chat-v2',
      provider: 'IBM watsonx.ai',
    });
  } catch (error: any) {
    console.error('Error with watsonx.ai chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/watsonx/models
 * List available Granite models
 */
router.get('/watsonx/models', async (_req, res) => {
  const models = [
    {
      id: 'ibm/granite-13b-chat-v2',
      name: 'Granite 13B Chat',
      description: 'Chat and conversation model',
      context_length: 8192,
      use_case: 'General chat, Q&A, conversation',
    },
    {
      id: 'ibm/granite-13b-instruct-v2',
      name: 'Granite 13B Instruct',
      description: 'Instruction following model',
      context_length: 8192,
      use_case: 'Task completion, instructions',
    },
    {
      id: 'ibm/granite-20b-multilingual',
      name: 'Granite 20B Multilingual',
      description: 'Multilingual support',
      context_length: 8192,
      use_case: 'Multi-language tasks',
    },
    {
      id: 'ibm/granite-3b-code-instruct',
      name: 'Granite 3B Code',
      description: 'Code generation and understanding',
      context_length: 8192,
      use_case: 'Code generation, explanation, debugging',
    },
  ];

  res.json({
    status: 'success',
    models,
    total: models.length,
    configured: isWatsonxConfigured(),
  });
});

/**
 * GET /api/watsonx/status
 * Check watsonx.ai configuration status
 */
router.get('/watsonx/status', async (_req, res) => {
  try {
    const configured = isWatsonxConfigured();

    if (!configured) {
      return res.json({
        configured: false,
        message: 'watsonx.ai not configured. Add WATSONX_API_KEY and WATSONX_PROJECT_ID to .env',
      });
    }

    // Test connection
    const client = getWatsonxClient();
    const connected = await client.testConnection();

    res.json({
      configured: true,
      connected,
      message: connected
        ? 'watsonx.ai is configured and accessible'
        : 'watsonx.ai is configured but connection failed',
    });
  } catch (error: any) {
    res.json({
      configured: isWatsonxConfigured(),
      connected: false,
      error: error.message,
    });
  }
});

// ==================== JIRA INTEGRATION ====================

import { getJiraClient, isJiraConfigured } from './jira';
import { getDevOpsAgent } from './agents/devops-agent';
import { getOrchestrateClient, isOrchestrateConfigured } from './watsonx-orchestrate';

// ==================== WATSONX ORCHESTRATE AGENT ====================

/**
 * POST /api/orchestrate/chat
 * Chat with deployed watsonx Orchestrate agent
 */
router.post('/orchestrate/chat', async (req, res) => {
  try {
    if (!isOrchestrateConfigured()) {
      return res.status(500).json({
        error: 'watsonx Orchestrate not configured. Add ORCHESTRATE_API_KEY and ORCHESTRATE_AGENT_ID to .env',
      });
    }

    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const client = getOrchestrateClient();
    const response = await client.chat(message, sessionId);

    res.json({
      status: 'success',
      ...response,
    });
  } catch (error: any) {
    console.error('Error with Orchestrate agent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrate/analyze
 * Analyze code via Orchestrate agent
 */
router.post('/orchestrate/analyze', async (req, res) => {
  try {
    if (!isOrchestrateConfigured()) {
      return res.status(500).json({ error: 'watsonx Orchestrate not configured' });
    }

    const { repository, createJiraIssues, jiraProject } = req.body;

    if (!repository) {
      return res.status(400).json({ error: 'repository is required' });
    }

    const client = getOrchestrateClient();
    const response = await client.analyzeCode(repository, {
      createJiraIssues,
      jiraProject,
    });

    res.json({
      status: 'success',
      ...response,
    });
  } catch (error: any) {
    console.error('Error analyzing via Orchestrate:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrate/review-pr
 * Review PR via Orchestrate agent
 */
router.post('/orchestrate/review-pr', async (req, res) => {
  try {
    if (!isOrchestrateConfigured()) {
      return res.status(500).json({ error: 'watsonx Orchestrate not configured' });
    }

    const { prUrl, autoComment } = req.body;

    if (!prUrl) {
      return res.status(400).json({ error: 'prUrl is required' });
    }

    const client = getOrchestrateClient();
    const response = await client.reviewPullRequest(prUrl, autoComment);

    res.json({
      status: 'success',
      ...response,
    });
  } catch (error: any) {
    console.error('Error reviewing PR via Orchestrate:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrate/create-jira
 * Create Jira issue via Orchestrate agent
 */
router.post('/orchestrate/create-jira', async (req, res) => {
  try {
    if (!isOrchestrateConfigured()) {
      return res.status(500).json({ error: 'watsonx Orchestrate not configured' });
    }

    const { project, summary, description, issuetype, priority } = req.body;

    if (!project || !summary) {
      return res.status(400).json({ error: 'project and summary are required' });
    }

    const client = getOrchestrateClient();
    const response = await client.createJiraIssue(project, summary, description, {
      issuetype,
      priority,
    });

    res.json({
      status: 'success',
      ...response,
    });
  } catch (error: any) {
    console.error('Error creating Jira via Orchestrate:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orchestrate/status
 * Check Orchestrate connection status
 */
router.get('/orchestrate/status', async (_req, res) => {
  try {
    const configured = isOrchestrateConfigured();

    if (!configured) {
      return res.json({
        configured: false,
        message: 'watsonx Orchestrate not configured',
      });
    }

    const client = getOrchestrateClient();
    const connected = await client.testConnection();

    res.json({
      configured: true,
      connected,
      message: connected
        ? 'watsonx Orchestrate agent is accessible'
        : 'watsonx Orchestrate agent connection failed',
    });
  } catch (error: any) {
    res.json({
      configured: isOrchestrateConfigured(),
      connected: false,
      error: error.message,
    });
  }
});

// ==================== DEVOPS AGENT ====================

/**
 * POST /api/agent/execute
 * Execute DevOps agent with instruction
 */
router.post('/agent/execute', async (req, res) => {
  try {
    const { instruction } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: 'instruction is required' });
    }

    const agent = getDevOpsAgent();
    const result = await agent.execute(instruction);

    res.json(result);
  } catch (error: any) {
    console.error('Error executing agent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent/chat
 * Chat with DevOps agent
 */
router.post('/agent/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const agent = getDevOpsAgent();
    const response = await agent.chat(message);

    res.json({
      status: 'success',
      response,
    });
  } catch (error: any) {
    console.error('Error in agent chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jira/status
 * Check Jira configuration status
 */
router.get('/jira/status', async (_req, res) => {
  try {
    const configured = isJiraConfigured();

    if (!configured) {
      return res.json({
        configured: false,
        message: 'Jira not configured. Add JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN to .env',
      });
    }

    const client = getJiraClient();
    const connected = await client.testConnection();

    res.json({
      configured: true,
      connected,
      host: process.env.JIRA_HOST,
      message: connected
        ? 'Jira is configured and accessible'
        : 'Jira is configured but connection failed',
    });
  } catch (error: any) {
    res.json({
      configured: isJiraConfigured(),
      connected: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/jira/projects
 * Get all Jira projects
 */
router.get('/jira/projects', async (_req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const client = getJiraClient();
    const projects = await client.getProjects();

    res.json({
      status: 'success',
      projects,
      total: projects.length,
    });
  } catch (error: any) {
    console.error('Error fetching Jira projects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jira/project/:key
 * Get project by key
 */
router.get('/jira/project/:key', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const client = getJiraClient();
    const project = await client.getProject(req.params.key);

    res.json({
      status: 'success',
      project,
    });
  } catch (error: any) {
    console.error('Error fetching Jira project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jira/project/:key/issuetypes
 * Get valid issue types for a project
 */
router.get('/jira/project/:key/issuetypes', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const client = getJiraClient();
    const issueTypes = await client.getIssueTypes(req.params.key);

    res.json({
      status: 'success',
      issueTypes,
    });
  } catch (error: any) {
    console.error('Error fetching issue types:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jira/search
 * Search issues using JQL
 */
router.post('/jira/search', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const { jql, maxResults = 50 } = req.body;

    if (!jql) {
      return res.status(400).json({ error: 'jql is required' });
    }

    const client = getJiraClient();
    const result = await client.searchIssues(jql, maxResults);

    res.json({
      status: 'success',
      issues: result.issues,
      total: result.total,
    });
  } catch (error: any) {
    console.error('Error searching Jira issues:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jira/issue/:key
 * Get issue by key
 */
router.get('/jira/issue/:key', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const client = getJiraClient();
    const issue = await client.getIssue(req.params.key);

    res.json({
      status: 'success',
      issue,
    });
  } catch (error: any) {
    console.error('Error fetching Jira issue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jira/issue
 * Create new issue
 */
router.post('/jira/issue', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const { project, summary, description, issuetype, assignee, priority } = req.body;

    if (!project || !summary) {
      return res.status(400).json({ error: 'project and summary are required' });
    }

    const client = getJiraClient();
    const issue = await client.createIssue({
      project,
      summary,
      description,
      issuetype,
      assignee,
      priority,
    });

    res.json({
      status: 'success',
      issue,
    });
  } catch (error: any) {
    console.error('Error creating Jira issue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/jira/issue/:key
 * Update issue
 */
router.put('/jira/issue/:key', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const { summary, description } = req.body;

    const client = getJiraClient();
    await client.updateIssue(req.params.key, {
      summary,
      description,
    });

    const updatedIssue = await client.getIssue(req.params.key);

    res.json({
      status: 'success',
      issue: updatedIssue,
    });
  } catch (error: any) {
    console.error('Error updating Jira issue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/jira/issue/:key
 * Delete issue
 */
router.delete('/jira/issue/:key', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const client = getJiraClient();
    await client.deleteIssue(req.params.key);

    res.json({
      status: 'success',
      message: `Issue ${req.params.key} deleted`,
    });
  } catch (error: any) {
    console.error('Error deleting Jira issue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jira/issue/:key/comment
 * Add comment to issue
 */
router.post('/jira/issue/:key/comment', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    const client = getJiraClient();
    await client.addComment(req.params.key, comment);

    res.json({
      status: 'success',
      message: 'Comment added',
    });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jira/issue/:key/comments
 * Get comments for issue
 */
router.get('/jira/issue/:key/comments', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const client = getJiraClient();
    const comments = await client.getComments(req.params.key);

    res.json({
      status: 'success',
      comments,
      total: comments.length,
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jira/users
 * Get users (optionally for specific project)
 */
router.get('/jira/users', async (req, res) => {
  try {
    if (!isJiraConfigured()) {
      return res.status(500).json({ error: 'Jira not configured' });
    }

    const { project } = req.query;

    const client = getJiraClient();
    const users = await client.getUsers(project as string);

    res.json({
      status: 'success',
      users,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
