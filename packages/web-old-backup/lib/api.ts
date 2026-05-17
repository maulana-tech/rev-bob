// API client utilities for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface PRAnalysisRequest {
  pr_url: string
  include_full_context?: boolean
}

export interface PRAnalysisResponse {
  analysis_id: string
  pr_number: number
  repository: string
  issues: Array<{
    severity: 'critical' | 'warning' | 'info'
    type: string
    message: string
    file: string
    line?: number
  }>
  impact_graph: {
    nodes: Array<{ id: string; label: string; type: string }>
    edges: Array<{ source: string; target: string; weight: number }>
  }
  review_comment: string
}

export interface DevFlowRequest {
  repo_path: string
  tasks: Array<'tests' | 'docs' | 'changelog'>
}

export interface DevFlowResponse {
  task_id: string
  results: {
    tests_generated?: number
    docs_updated?: number
    changelog_entries?: number
  }
  time_saved_minutes: number
}

export interface LegacyCodeRequest {
  repo_url: string
}

export interface LegacyCodeResponse {
  index_id: string
  repository: string
  knowledge_graph: {
    nodes: Array<{ id: string; label: string; type: string; metrics: any }>
    edges: Array<{ source: string; target: string; type: string }>
  }
  stats: {
    total_files: number
    total_functions: number
    total_classes: number
  }
}

export interface ChatRequest {
  index_id: string
  question: string
}

export interface ChatResponse {
  answer: string
  context_used: Array<{ file: string; content: string }>
  related_components: string[]
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Health check
  async health() {
    return this.request<{ status: string; timestamp: string }>('/health')
  }

  // CodeReview endpoints
  async analyzePR(data: PRAnalysisRequest): Promise<PRAnalysisResponse> {
    return this.request<PRAnalysisResponse>('/api/code-review/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPRAnalysis(analysisId: string): Promise<PRAnalysisResponse> {
    return this.request<PRAnalysisResponse>(`/api/code-review/analysis/${analysisId}`)
  }

  // DevFlow endpoints
  async runDevFlow(data: DevFlowRequest): Promise<DevFlowResponse> {
    return this.request<DevFlowResponse>('/api/devflow/run', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDevFlowAnalytics() {
    return this.request<{
      total_time_saved: number
      tasks_completed: number
      breakdown: Record<string, number>
    }>('/api/devflow/analytics')
  }

  // LegacyCode endpoints
  async indexRepository(data: LegacyCodeRequest): Promise<LegacyCodeResponse> {
    return this.request<LegacyCodeResponse>('/api/legacy-code/analyze', {
      method: 'POST',
      body: JSON.stringify({ repo_url: data.repo_url }),
    })
  }

  async getKnowledgeGraph(indexId: string): Promise<LegacyCodeResponse> {
    return this.request<LegacyCodeResponse>(`/api/legacy-code/graph/${indexId}`)
  }

  async chatWithCode(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/legacy-code/chat', {
      method: 'POST',
      body: JSON.stringify({ repo_id: data.index_id, question: data.question }),
    })
  }

  async generateWiki(indexId: string) {
    return this.request<{ wiki_markdown: string; modules: string[] }>(
      `/api/legacy-code/wiki/generate`,
      { method: 'POST', body: JSON.stringify({ repo_id: indexId }) }
    )
  }

  async getDangerZones(indexId: string) {
    return this.request<{
      untested_functions: string[]
      undocumented_code: string[]
      high_complexity: string[]
    }>(`/api/legacy-code/danger-zones/${indexId}`)
  }
}

export const api = new APIClient()

// Made with Bob
