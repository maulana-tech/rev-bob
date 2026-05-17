/**
 * watsonx Orchestrate Integration
 *
 * Call deployed agents in watsonx Orchestrate from DevTools AI Suite
 */

interface OrchestrateConfig {
  apiKey: string;
  agentId: string;
  region: string; // 'us-south', 'eu-de', 'au-syd'
}

interface OrchestrateMessage {
  message: string;
  context?: Record<string, any>;
  sessionId?: string;
}

interface OrchestrateResponse {
  response: string;
  context?: Record<string, any>;
  sessionId: string;
  metadata?: {
    toolsUsed?: string[];
    jiraIssues?: string[];
    confidence?: number;
  };
}

class WatsonxOrchestrateClient {
  private apiKey: string;
  private agentId: string;
  private baseUrl: string;

  constructor(config: OrchestrateConfig) {
    this.apiKey = config.apiKey;
    this.agentId = config.agentId;

    // Set base URL based on region
    const regionUrls: Record<string, string> = {
      'us-south': 'https://us-south.watsonx.orchestrate.ibm.com',
      'eu-de': 'https://eu-de.watsonx.orchestrate.ibm.com',
      'au-syd': 'https://au-syd.watsonx.orchestrate.ibm.com',
    };

    this.baseUrl = regionUrls[config.region] || regionUrls['us-south'];
  }

  /**
   * Send message to deployed agent
   */
  async sendMessage(
    message: string,
    options: {
      context?: Record<string, any>;
      sessionId?: string;
    } = {}
  ): Promise<OrchestrateResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/agents/${this.agentId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message,
            context: options.context || {},
            sessionId: options.sessionId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`watsonx Orchestrate API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as any;

      return {
        response: data.response || data.output?.text || '',
        context: data.context,
        sessionId: data.sessionId || data.session_id,
        metadata: {
          toolsUsed: data.tools_used || [],
          jiraIssues: this.extractJiraIssues(data.response),
          confidence: data.confidence,
        },
      };
    } catch (error: any) {
      console.error('[watsonx Orchestrate] Error:', error.message);
      throw error;
    }
  }

  /**
   * Execute workflow via agent
   */
  async executeWorkflow(
    workflow: string,
    parameters: Record<string, any>
  ): Promise<OrchestrateResponse> {
    const message = `Execute workflow: ${workflow}

Parameters:
${JSON.stringify(parameters, null, 2)}`;

    return await this.sendMessage(message, {
      context: {
        workflow,
        parameters,
      },
    });
  }

  /**
   * Analyze code via agent
   */
  async analyzeCode(
    repositoryUrl: string,
    options: {
      createJiraIssues?: boolean;
      jiraProject?: string;
    } = {}
  ): Promise<OrchestrateResponse> {
    const message = `Analyze code repository: ${repositoryUrl}

${options.createJiraIssues ? `Create Jira issues in project: ${options.jiraProject || 'KAN'}` : ''}

Focus on:
- Security vulnerabilities
- Code quality issues
- Performance problems
- Best practice violations`;

    return await this.sendMessage(message, {
      context: {
        repository: repositoryUrl,
        createJiraIssues: options.createJiraIssues,
        jiraProject: options.jiraProject,
      },
    });
  }

  /**
   * Review pull request via agent
   */
  async reviewPullRequest(
    prUrl: string,
    autoComment: boolean = false
  ): Promise<OrchestrateResponse> {
    const message = `Review this pull request: ${prUrl}

Analyze:
- Code changes
- Potential bugs
- Security issues
- Code quality
- Test coverage

${autoComment ? 'Add review comments to GitHub PR' : ''}`;

    return await this.sendMessage(message, {
      context: {
        prUrl,
        autoComment,
      },
    });
  }

  /**
   * Create Jira issue via agent
   */
  async createJiraIssue(
    project: string,
    summary: string,
    description: string,
    options: {
      issuetype?: string;
      priority?: string;
    } = {}
  ): Promise<OrchestrateResponse> {
    const message = `Create Jira issue:

Project: ${project}
Summary: ${summary}
Type: ${options.issuetype || 'Task'}
Priority: ${options.priority || 'Medium'}

Description:
${description}`;

    return await this.sendMessage(message, {
      context: {
        action: 'create_jira_issue',
        project,
        summary,
        description,
        ...options,
      },
    });
  }

  /**
   * Chat with agent (conversational)
   */
  async chat(
    userMessage: string,
    sessionId?: string
  ): Promise<OrchestrateResponse> {
    return await this.sendMessage(userMessage, { sessionId });
  }

  /**
   * Extract Jira issue keys from response
   */
  private extractJiraIssues(text: string): string[] {
    const regex = /[A-Z]+-\d+/g;
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Test connection to agent
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage('Hello, are you there?');
      return !!response.response;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let orchestrateClient: WatsonxOrchestrateClient | null = null;

export const getOrchestrateClient = (): WatsonxOrchestrateClient => {
  if (!orchestrateClient) {
    const apiKey = process.env.ORCHESTRATE_API_KEY;
    const agentId = process.env.ORCHESTRATE_AGENT_ID;
    const region = process.env.ORCHESTRATE_REGION || 'au-syd';

    if (!apiKey || !agentId) {
      throw new Error(
        'ORCHESTRATE_API_KEY and ORCHESTRATE_AGENT_ID must be set in environment variables'
      );
    }

    orchestrateClient = new WatsonxOrchestrateClient({
      apiKey,
      agentId,
      region,
    });
  }

  return orchestrateClient;
};

export const isOrchestrateConfigured = (): boolean => {
  return !!(
    process.env.ORCHESTRATE_API_KEY && process.env.ORCHESTRATE_AGENT_ID
  );
};

export default WatsonxOrchestrateClient;
