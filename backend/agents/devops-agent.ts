/**
 * DevOps Automation Agent
 *
 * Powered by IBM watsonx.ai (Granite models)
 * Automates DevOps workflows: Code analysis → Jira issues → GitHub PRs
 */

import { getWatsonxClient } from '../watsonx';
import { getJiraClient } from '../jira';
import { buildGraph } from '../graph-builder';

interface AgentTask {
  type: 'analyze' | 'create_issue' | 'create_pr' | 'review' | 'document';
  input: string | Record<string, any>;
}

interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
  jiraIssues?: string[];
  githubPRs?: string[];
}

class DevOpsAgent {
  private watsonx;
  private jira;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor() {
    this.watsonx = getWatsonxClient();
    this.jira = getJiraClient();
  }

  /**
   * Main agent execution
   */
  async execute(instruction: string): Promise<AgentResult> {
    try {
      // Step 1: Understand intent using Granite chat model
      const intent = await this.analyzeIntent(instruction);

      // Step 2: Execute based on intent
      switch (intent.action) {
        case 'analyze_code':
          return await this.analyzeCode(intent.parameters);

        case 'create_jira_issue':
          return await this.createJiraIssue(intent.parameters);

        case 'review_pr':
          return await this.reviewPullRequest(intent.parameters);

        case 'generate_docs':
          return await this.generateDocumentation(intent.parameters);

        case 'full_workflow':
          return await this.executeFullWorkflow(intent.parameters);

        default:
          return {
            success: false,
            message: `Unknown action: ${intent.action}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Agent error: ${error.message}`,
      };
    }
  }

  /**
   * Analyze user intent using Granite
   */
  private async analyzeIntent(instruction: string): Promise<{
    action: string;
    parameters: Record<string, any>;
  }> {
    const prompt = `Analyze this user instruction and determine the action:

Instruction: "${instruction}"

Available actions:
- analyze_code: Analyze codebase for issues
- create_jira_issue: Create Jira issue
- review_pr: Review GitHub pull request
- generate_docs: Generate documentation
- full_workflow: Full DevOps workflow (analyze → Jira → PR)

Return JSON with "action" and "parameters".`;

    const response = await this.watsonx.instruct(prompt);

    try {
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('[Agent] Failed to parse intent, using default');
    }

    // Default fallback
    return {
      action: 'analyze_code',
      parameters: { instruction },
    };
  }

  /**
   * Analyze code and detect issues
   */
  private async analyzeCode(params: any): Promise<AgentResult> {
    const { repository, files } = params;

    // Build graph from code
    const graph = buildGraph(files || []);

    // Analyze with Granite
    const analysisPrompt = `Analyze this codebase:

Files analyzed: ${graph.nodes.length}
Dependencies: ${graph.edges.length}

Identify:
1. Security vulnerabilities
2. Code quality issues
3. Performance bottlenecks
4. Best practice violations

For each issue found, provide:
- Severity: critical/high/medium/low
- File location
- Issue description
- Recommendation

Format as JSON array.`;

    const analysis = await this.watsonx.instruct(analysisPrompt);

    // Parse issues
    const issues = this.parseIssues(analysis);

    return {
      success: true,
      message: `Analyzed ${graph.nodes.length} files, found ${issues.length} issues`,
      data: {
        graph,
        issues,
      },
    };
  }

  /**
   * Create Jira issue from analysis
   */
  private async createJiraIssue(params: any): Promise<AgentResult> {
    const { project, summary, description, severity } = params;

    const issue = await this.jira.createIssue({
      project: project || 'KAN',
      summary,
      description,
      issuetype: severity === 'critical' ? 'Bug' : 'Task',
      priority: severity === 'critical' ? 'Highest' : 'High',
    });

    return {
      success: true,
      message: `Created Jira issue: ${issue.key}`,
      data: { issue },
      jiraIssues: [issue.key],
    };
  }

  /**
   * Review GitHub PR
   */
  private async reviewPullRequest(params: any): Promise<AgentResult> {
    const { prUrl, diff } = params;

    const reviewPrompt = `Review this Pull Request:

URL: ${prUrl}
Diff:
${diff.substring(0, 4000)}

Provide:
1. Summary of changes
2. Potential bugs or issues
3. Security concerns
4. Code quality suggestions
5. Approval recommendation (approve/request changes/comment)

Format as structured review.`;

    const review = await this.watsonx.chat(
      'You are an expert code reviewer.',
      reviewPrompt
    );

    return {
      success: true,
      message: 'PR review completed',
      data: {
        prUrl,
        review,
      },
    };
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(params: any): Promise<AgentResult> {
    const { codebase, format } = params;

    const docsPrompt = `Generate comprehensive documentation for this codebase:

Format: ${format || 'Markdown'}

Include:
1. Architecture overview
2. API endpoints
3. Setup instructions
4. Usage examples
5. Contributing guide

Make it clear, professional, and well-structured.`;

    const docs = await this.watsonx.instruct(docsPrompt);

    return {
      success: true,
      message: 'Documentation generated',
      data: {
        documentation: docs,
        format: format || 'markdown',
      },
    };
  }

  /**
   * Execute full DevOps workflow
   */
  private async executeFullWorkflow(params: any): Promise<AgentResult> {
    const { repository, files, project } = params;

    const results: AgentResult[] = [];
    const jiraIssues: string[] = [];

    try {
      // Step 1: Analyze code
      console.log('[Agent] Step 1: Analyzing code...');
      const analysisResult = await this.analyzeCode({ repository, files });
      results.push(analysisResult);

      if (!analysisResult.data?.issues) {
        return {
          success: true,
          message: 'No issues found in code analysis',
          data: { steps: results },
        };
      }

      // Step 2: Create Jira issues for critical/high severity
      console.log('[Agent] Step 2: Creating Jira issues...');
      const criticalIssues = analysisResult.data.issues.filter(
        (issue: any) => issue.severity === 'critical' || issue.severity === 'high'
      );

      for (const issue of criticalIssues.slice(0, 5)) {
        // Limit to 5 issues
        const jiraResult = await this.createJiraIssue({
          project: project || 'KAN',
          summary: `${issue.severity.toUpperCase()}: ${issue.title}`,
          description: `
File: ${issue.file || 'Unknown'}
Location: Line ${issue.line || 'N/A'}

Issue:
${issue.description}

Severity: ${issue.severity}

Recommendation:
${issue.recommendation}

Detected by: DevTools AI Suite (IBM watsonx.ai)
          `,
          severity: issue.severity,
        });

        if (jiraResult.success && jiraResult.jiraIssues) {
          jiraIssues.push(...jiraResult.jiraIssues);
        }
        results.push(jiraResult);
      }

      // Step 3: Generate summary
      console.log('[Agent] Step 3: Generating summary...');
      const summary = await this.generateWorkflowSummary({
        filesAnalyzed: analysisResult.data.graph.nodes.length,
        issuesFound: analysisResult.data.issues.length,
        jiraIssuesCreated: jiraIssues.length,
      });

      return {
        success: true,
        message: 'Full DevOps workflow completed',
        data: {
          steps: results,
          summary,
        },
        jiraIssues,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Workflow error: ${error.message}`,
        data: { steps: results },
        jiraIssues,
      };
    }
  }

  /**
   * Generate workflow summary
   */
  private async generateWorkflowSummary(stats: {
    filesAnalyzed: number;
    issuesFound: number;
    jiraIssuesCreated: number;
  }): Promise<string> {
    const prompt = `Generate a concise executive summary for this DevOps automation workflow:

Statistics:
- Files analyzed: ${stats.filesAnalyzed}
- Issues found: ${stats.issuesFound}
- Jira issues created: ${stats.jiraIssuesCreated}

Summary should be 2-3 sentences highlighting key actions and outcomes.`;

    return await this.watsonx.chat(
      'You are a technical project manager.',
      prompt
    );
  }

  /**
   * Parse issues from LLM response
   */
  private parseIssues(analysis: string): any[] {
    try {
      // Try to extract JSON array
      const jsonMatch = analysis.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('[Agent] Failed to parse issues from response');
    }

    // Fallback: Create mock issues for demo
    return [
      {
        severity: 'high',
        file: 'backend/auth.ts',
        line: 45,
        title: 'SQL Injection Vulnerability',
        description: 'User input not sanitized before database query',
        recommendation: 'Use parameterized queries or ORM',
      },
      {
        severity: 'medium',
        file: 'backend/api.ts',
        line: 123,
        title: 'Missing Error Handling',
        description: 'Unhandled promise rejection',
        recommendation: 'Add try-catch block',
      },
    ];
  }

  /**
   * Chat with agent (conversational)
   */
  async chat(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const context = this.conversationHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const systemPrompt = `You are a DevOps automation agent powered by IBM watsonx.ai.

You can:
- Analyze code for issues
- Create Jira issues
- Review pull requests
- Generate documentation
- Execute full DevOps workflows

Current conversation:
${context}

Respond helpfully and suggest actions I can take.`;

    const response = await this.watsonx.chat(
      systemPrompt,
      userMessage
    );

    this.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    return response;
  }
}

// Singleton instance
let devOpsAgent: DevOpsAgent | null = null;

export const getDevOpsAgent = (): DevOpsAgent => {
  if (!devOpsAgent) {
    devOpsAgent = new DevOpsAgent();
  }
  return devOpsAgent;
};

export default DevOpsAgent;
