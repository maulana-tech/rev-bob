/**
 * IBM watsonx.ai Client
 *
 * Provides access to IBM Granite foundation models
 * for AI-powered development tasks
 */

import fetch from 'node-fetch';

interface WatsonxConfig {
  apiKey: string;
  projectId: string;
  url: string;
}

interface GenerationParams {
  max_new_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  stop_sequences?: string[];
}

interface GenerationRequest {
  model_id: string;
  input: string;
  parameters?: GenerationParams;
}

interface IAMTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GenerationResponse {
  results: Array<{
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
  }>;
}

class WatsonxClient {
  private apiKey: string;
  private projectId: string;
  private baseUrl: string;
  private iamToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: WatsonxConfig) {
    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.baseUrl = config.url;
  }

  /**
   * Get IAM token for authentication
   * Tokens are cached and reused until near expiry
   */
  private async getIAMToken(): Promise<string> {
    // Check if token is still valid (with 5 min buffer)
    if (this.iamToken && Date.now() < this.tokenExpiry - 300000) {
      return this.iamToken;
    }

    try {
      const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apiKey,
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get IAM token: ${response.status} - ${error}`);
      }

      const data = await response.json() as IAMTokenResponse;
      this.iamToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.iamToken;
    } catch (error: any) {
      console.error('[watsonx.ai] Error getting IAM token:', error.message);
      throw new Error(`watsonx.ai authentication failed: ${error.message}`);
    }
  }

  /**
   * Generate text using watsonx.ai
   */
  async generate(request: GenerationRequest): Promise<string> {
    try {
      const token = await this.getIAMToken();

      const response = await fetch(
        `${this.baseUrl}/ml/v1/text/generation?version=2023-05-29`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            ...request,
            project_id: this.projectId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`watsonx.ai API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as GenerationResponse;

      if (!data.results || data.results.length === 0) {
        throw new Error('No results returned from watsonx.ai');
      }

      return data.results[0].generated_text;
    } catch (error: any) {
      console.error('[watsonx.ai] Error generating text:', error.message);
      throw error;
    }
  }

  /**
   * Chat completion using Granite chat model
   */
  async chat(
    systemPrompt: string,
    userPrompt: string,
    params?: GenerationParams
  ): Promise<string> {
    const input = `System: ${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;

    return this.generate({
      model_id: 'ibm/granite-13b-chat-v2',
      input,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
        repetition_penalty: 1.1,
        ...params,
      },
    });
  }

  /**
   * Instruction following using Granite instruct model
   */
  async instruct(
    instruction: string,
    params?: GenerationParams
  ): Promise<string> {
    return this.generate({
      model_id: 'ibm/granite-13b-instruct-v2',
      input: instruction,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.3,
        top_p: 0.9,
        ...params,
      },
    });
  }

  /**
   * Code generation using Granite code model
   */
  async generateCode(
    instruction: string,
    params?: GenerationParams
  ): Promise<string> {
    return this.generate({
      model_id: 'ibm/granite-3b-code-instruct',
      input: instruction,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.2,
        top_p: 0.95,
        repetition_penalty: 1.05,
        ...params,
      },
    });
  }

  /**
   * Multilingual generation using Granite multilingual model
   */
  async generateMultilingual(
    prompt: string,
    params?: GenerationParams
  ): Promise<string> {
    return this.generate({
      model_id: 'ibm/granite-20b-multilingual',
      input: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        ...params,
      },
    });
  }

  /**
   * Test connection to watsonx.ai
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await this.getIAMToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
let watsonxClient: WatsonxClient | null = null;

export const getWatsonxClient = (): WatsonxClient => {
  if (!watsonxClient) {
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;

    if (!apiKey || !projectId) {
      throw new Error('WATSONX_API_KEY and WATSONX_PROJECT_ID must be set in environment variables');
    }

    watsonxClient = new WatsonxClient({
      apiKey,
      projectId,
      url: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
    });
  }

  return watsonxClient;
};

export const isWatsonxConfigured = (): boolean => {
  return !!(process.env.WATSONX_API_KEY && process.env.WATSONX_PROJECT_ID);
};

export default WatsonxClient;
