/**
 * NVIDIA AI Integration
 *
 * Fallback LLM provider using NVIDIA NIM API
 * Free tier available at build.nvidia.com
 */

interface NvidiaAIConfig {
  apiKey: string;
  model?: string;
}

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class NvidiaAIClient {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: NvidiaAIConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = 'https://integrate.api.nvidia.com/v1';
    this.model = config.model || 'meta/llama-3.1-70b-instruct'; // Default: Llama 3.1 70B
  }

  /**
   * Chat completion with NVIDIA AI
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<string> {
    try {
      const messages: NvidiaMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout

      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            max_tokens: options.maxTokens || 2048,
            temperature: options.temperature || 0.7,
            top_p: 0.9,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`NVIDIA AI API error: ${response.status} - ${error}`);
        }

        const data = await response.json() as any;

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from NVIDIA AI');
        }

        return data.choices[0].message.content;
      } catch (fetchError: any) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
          throw new Error('NVIDIA AI request timed out after 120 seconds');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('[NVIDIA AI] Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate code analysis
   */
  async analyzeCode(code: string, language: string): Promise<string> {
    const systemPrompt = `You are an expert DevOps analyst powered by NVIDIA AI.
Analyze code for security vulnerabilities, code quality issues, and performance problems.
Provide detailed, actionable recommendations with specific line numbers and fixes.`;

    const userPrompt = `Analyze this ${language} code for issues:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Security vulnerabilities (if any)
2. Code quality issues
3. Performance concerns
4. Specific recommendations with code examples`;

    return await this.chat(systemPrompt, userPrompt, {
      maxTokens: 2048,
      temperature: 0.3,
    });
  }

  /**
   * Answer developer questions
   */
  async answerQuestion(question: string, context?: string): Promise<string> {
    const systemPrompt = `You are an AI DevOps analyst powered by NVIDIA AI.
Help developers with code analysis, security issues, and best practices.
Provide clear, actionable answers with code examples when relevant.`;

    const userPrompt = context
      ? `Context: ${context}\n\nQuestion: ${question}`
      : question;

    return await this.chat(systemPrompt, userPrompt);
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.chat(
        'You are a helpful assistant.',
        'Say "Hello" in one word.',
        { maxTokens: 10 }
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let nvidiaClient: NvidiaAIClient | null = null;

export const getNvidiaAIClient = (): NvidiaAIClient => {
  if (!nvidiaClient) {
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY must be set in environment variables');
    }

    nvidiaClient = new NvidiaAIClient({
      apiKey,
      model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
    });
  }

  return nvidiaClient;
};

export const isNvidiaAIConfigured = (): boolean => {
  return !!process.env.NVIDIA_API_KEY;
};

export default NvidiaAIClient;
