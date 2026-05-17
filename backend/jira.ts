/**
 * Jira Cloud API Client
 *
 * Direct integration with Jira Cloud REST API
 * Bypasses watsonx Orchestrate connector issues
 */

interface JiraConfig {
  host: string;
  email: string;
  apiToken: string;
}

interface JiraIssue {
  key: string;
  id: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    project: {
      key: string;
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    created: string;
    updated: string;
  };
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  active: boolean;
}

interface CreateIssuePayload {
  project: string;
  summary: string;
  description?: string;
  issuetype?: string;
  assignee?: string;
  priority?: string;
}

class JiraClient {
  private host: string;
  private email: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(config: JiraConfig) {
    this.host = config.host.replace(/\/$/, ''); // Remove trailing slash
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.baseUrl = `${this.host}/rest/api/3`;
  }

  /**
   * Get authorization header (Basic Auth)
   */
  private getAuthHeader(): string {
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    return `Basic ${auth}`;
  }

  /**
   * Make API request to Jira
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${response.status} - ${error}`);
    }

    return await response.json() as T;
  }

  /**
   * Test connection to Jira
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/myself', { method: 'GET' });
      return true;
    } catch (error) {
      console.error('[Jira] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<JiraUser> {
    return await this.request<JiraUser>('/myself', { method: 'GET' });
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<JiraProject[]> {
    return await this.request<JiraProject[]>('/project', { method: 'GET' });
  }

  /**
   * Get project by key
   */
  async getProject(projectKey: string): Promise<JiraProject> {
    return await this.request<JiraProject>(`/project/${projectKey}`, {
      method: 'GET',
    });
  }

  /**
   * Get issue types for a project
   */
  async getIssueTypes(projectKey: string): Promise<Array<{ id: string; name: string; description?: string }>> {
    const types = await this.request<Array<{ id: string; name: string; description?: string }>>(
      `/project/${projectKey}/issuetypes`,
      { method: 'GET' }
    );
    return types.filter(t => t.name !== 'Sub-task');
  }

  /**
   * Search issues using JQL
   */
  async searchIssues(jql: string, maxResults: number = 50): Promise<{
    issues: JiraIssue[];
    total: number;
  }> {
    const response = await this.request<{
      issues: JiraIssue[];
      total: number;
    }>('/search', {
      method: 'POST',
      body: JSON.stringify({
        jql,
        maxResults,
        fields: [
          'summary',
          'description',
          'status',
          'issuetype',
          'project',
          'assignee',
          'created',
          'updated',
        ],
      }),
    });

    return response;
  }

  /**
   * Get issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    return await this.request<JiraIssue>(`/issue/${issueKey}`, {
      method: 'GET',
    });
  }

  /**
   * Create new issue
   */
  async createIssue(payload: CreateIssuePayload): Promise<JiraIssue> {
    const issueData = {
      fields: {
        project: {
          key: payload.project,
        },
        summary: payload.summary,
        description: payload.description
          ? {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: payload.description,
                    },
                  ],
                },
              ],
            }
          : undefined,
        issuetype: {
          name: payload.issuetype || 'Task',
        },
        ...(payload.assignee && {
          assignee: {
            id: payload.assignee,
          },
        }),
        ...(payload.priority && {
          priority: {
            name: payload.priority,
          },
        }),
      },
    };

    const response = await this.request<{ key: string; id: string }>(
      '/issue',
      {
        method: 'POST',
        body: JSON.stringify(issueData),
      }
    );

    return await this.getIssue(response.key);
  }

  /**
   * Update issue
   */
  async updateIssue(
    issueKey: string,
    updates: Partial<CreateIssuePayload>
  ): Promise<void> {
    const fields: Record<string, any> = {};

    if (updates.summary) {
      fields.summary = updates.summary;
    }

    if (updates.description) {
      fields.description = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: updates.description,
              },
            ],
          },
        ],
      };
    }

    await this.request(`/issue/${issueKey}`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    });
  }

  /**
   * Delete issue
   */
  async deleteIssue(issueKey: string): Promise<void> {
    await this.request(`/issue/${issueKey}`, { method: 'DELETE' });
  }

  /**
   * Add comment to issue
   */
  async addComment(issueKey: string, comment: string): Promise<void> {
    await this.request(`/issue/${issueKey}/comment`, {
      method: 'POST',
      body: JSON.stringify({
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: comment,
                },
              ],
            },
          ],
        },
      }),
    });
  }

  /**
   * Get comments for issue
   */
  async getComments(issueKey: string): Promise<any[]> {
    const response = await this.request<{ comments: any[] }>(
      `/issue/${issueKey}/comment`,
      { method: 'GET' }
    );
    return response.comments;
  }

  /**
   * Get users (assignable)
   */
  async getUsers(projectKey?: string): Promise<JiraUser[]> {
    const endpoint = projectKey
      ? `/user/assignable/search?project=${projectKey}`
      : `/users/search`;

    return await this.request<JiraUser[]>(endpoint, { method: 'GET' });
  }

  /**
   * Transition issue (change status)
   */
  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    await this.request(`/issue/${issueKey}/transitions`, {
      method: 'POST',
      body: JSON.stringify({
        transition: {
          id: transitionId,
        },
      }),
    });
  }

  /**
   * Get available transitions for issue
   */
  async getTransitions(issueKey: string): Promise<any[]> {
    const response = await this.request<{ transitions: any[] }>(
      `/issue/${issueKey}/transitions`,
      { method: 'GET' }
    );
    return response.transitions;
  }
}

// Singleton instance
let jiraClient: JiraClient | null = null;

export const getJiraClient = (): JiraClient => {
  if (!jiraClient) {
    const host = process.env.JIRA_HOST;
    const email = process.env.JIRA_EMAIL;
    const apiToken = process.env.JIRA_API_TOKEN;

    if (!host || !email || !apiToken) {
      throw new Error(
        'JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN must be set in environment variables'
      );
    }

    jiraClient = new JiraClient({
      host,
      email,
      apiToken,
    });
  }

  return jiraClient;
};

export const isJiraConfigured = (): boolean => {
  return !!(
    process.env.JIRA_HOST &&
    process.env.JIRA_EMAIL &&
    process.env.JIRA_API_TOKEN
  );
};

export default JiraClient;
