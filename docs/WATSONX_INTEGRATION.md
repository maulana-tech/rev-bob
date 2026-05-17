# IBM watsonx.ai Integration Guide

**Date**: May 16, 2024  
**Purpose**: Integrate IBM watsonx.ai API with DevTools AI Suite

---

## 📋 Overview

IBM watsonx.ai provides access to foundation models including IBM's Granite models for AI-powered development tasks.

### Key Features
- ✅ IBM Granite models
- ✅ Multiple foundation models
- ✅ Prompt Lab for testing
- ✅ Inference API
- ✅ Fine-tuning capabilities

---

## 🔑 Authentication

### Required Credentials

1. **API Key**: Get from IBM Cloud
2. **Project ID**: From watsonx.ai project
3. **Base URL**: `https://us-south.ml.cloud.ibm.com`

### Getting Credentials

1. Go to: https://cloud.ibm.com
2. Create watsonx.ai service instance
3. Create project in watsonx.ai
4. Get API key from IBM Cloud IAM
5. Get Project ID from project settings

---

## 🚀 Quick Start

### Environment Variables

Add to `backend/.env`:

```bash
# IBM watsonx.ai
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

---

## 📡 API Integration

### Available Granite Models

| Model ID | Description | Context Length |
|----------|-------------|----------------|
| `ibm/granite-13b-chat-v2` | Chat model | 8K tokens |
| `ibm/granite-13b-instruct-v2` | Instruction following | 8K tokens |
| `ibm/granite-20b-multilingual` | Multilingual support | 8K tokens |
| `ibm/granite-3b-code-instruct` | Code generation | 8K tokens |

### Request Format

**Endpoint**: `POST /ml/v1/text/generation?version=2023-05-29`

**Headers**:
```json
{
  "Authorization": "Bearer {IAM_TOKEN}",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Body**:
```json
{
  "model_id": "ibm/granite-13b-chat-v2",
  "input": "Your prompt here",
  "parameters": {
    "max_new_tokens": 1024,
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 50
  },
  "project_id": "YOUR_PROJECT_ID"
}
```

---

## 💻 Implementation

### Step 1: Create watsonx.ai Client

Create `backend/watsonx.ts`:

```typescript
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
}

interface GenerationRequest {
  model_id: string;
  input: string;
  parameters?: GenerationParams;
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get IAM token: ${response.statusText}`);
      }

      const data = await response.json() as any;
      this.iamToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.iamToken;
    } catch (error) {
      console.error('Error getting IAM token:', error);
      throw error;
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

      const data = await response.json() as any;
      return data.results[0].generated_text;
    } catch (error) {
      console.error('Error calling watsonx.ai:', error);
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
        ...params,
      },
    });
  }
}

// Export singleton instance
let watsonxClient: WatsonxClient | null = null;

export const getWatsonxClient = (): WatsonxClient => {
  if (!watsonxClient) {
    if (!process.env.WATSONX_API_KEY || !process.env.WATSONX_PROJECT_ID) {
      throw new Error('WATSONX_API_KEY and WATSONX_PROJECT_ID must be set');
    }

    watsonxClient = new WatsonxClient({
      apiKey: process.env.WATSONX_API_KEY,
      projectId: process.env.WATSONX_PROJECT_ID,
      url: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
    });
  }

  return watsonxClient;
};

export default WatsonxClient;
```

---

### Step 2: Update LLM Provider List

Modify `backend/index.ts` to include watsonx.ai:

```typescript
import { getWatsonxClient } from './watsonx';

// Add to LLM providers
const providers: LLMProvider[] = [
  // ... existing providers ...
  
  // IBM watsonx.ai (Granite models)
  {
    name: 'watsonx',
    isConfigured: !!(process.env.WATSONX_API_KEY && process.env.WATSONX_PROJECT_ID),
    call: async (systemPrompt: string, userPrompt: string) => {
      const client = getWatsonxClient();
      return await client.chat(systemPrompt, userPrompt);
    },
  },
];
```

---

### Step 3: Add watsonx-Specific Endpoint

Add to `backend/routes-devtools.ts`:

```typescript
/**
 * POST /api/watsonx/generate
 * Generate text using IBM watsonx.ai Granite models
 */
router.post('/watsonx/generate', async (req, res) => {
  try {
    const { model, prompt, parameters } = req.body;

    if (!process.env.WATSONX_API_KEY) {
      return res.status(500).json({ 
        error: 'watsonx.ai not configured. Add WATSONX_API_KEY to .env' 
      });
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

    if (!process.env.WATSONX_API_KEY) {
      return res.status(500).json({ 
        error: 'watsonx.ai not configured' 
      });
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
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
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
    },
    {
      id: 'ibm/granite-13b-instruct-v2',
      name: 'Granite 13B Instruct',
      description: 'Instruction following model',
      context_length: 8192,
    },
    {
      id: 'ibm/granite-20b-multilingual',
      name: 'Granite 20B Multilingual',
      description: 'Multilingual support',
      context_length: 8192,
    },
    {
      id: 'ibm/granite-3b-code-instruct',
      name: 'Granite 3B Code',
      description: 'Code generation and understanding',
      context_length: 8192,
    },
  ];

  res.json({
    status: 'success',
    models,
    total: models.length,
  });
});
```

---

## 🧪 Testing

### Test watsonx.ai Integration

```bash
# 1. Test text generation
curl -X POST http://localhost:3001/api/watsonx/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ibm/granite-13b-chat-v2",
    "prompt": "Explain what a REST API is",
    "parameters": {
      "max_new_tokens": 500,
      "temperature": 0.7
    }
  }'

# 2. Test code generation
curl -X POST http://localhost:3001/api/watsonx/code \
  -H "Content-Type: application/json" \
  -d '{
    "instruction": "Create a function to calculate fibonacci numbers",
    "language": "python"
  }'

# 3. List available models
curl http://localhost:3001/api/watsonx/models
```

---

## 📊 Use Cases

### 1. Code Review with Granite

```typescript
// Use Granite for code review
const review = await watsonxClient.chat(
  'You are an expert code reviewer.',
  `Review this code:\n\n${code}\n\nProvide feedback on quality, bugs, and improvements.`
);
```

### 2. Test Generation with Granite

```typescript
// Use Granite code model for test generation
const tests = await watsonxClient.generateCode(
  `Generate comprehensive unit tests for this function:\n\n${functionCode}`
);
```

### 3. Documentation with Granite

```typescript
// Use Granite for documentation
const docs = await watsonxClient.chat(
  'You are a technical writer.',
  `Generate comprehensive documentation for this API:\n\n${apiCode}`
);
```

---

## 🎯 Integration Benefits

### Why Add watsonx.ai?

1. **Hackathon Requirement** ✅
   - Specifically mentioned in hackathon guide
   - Shows use of IBM ecosystem

2. **Granite Models** ✅
   - Specialized for code tasks
   - Better performance on technical content
   - Multilingual support

3. **IBM Cloud Integration** ✅
   - Native IBM platform
   - Enterprise features
   - Better support

4. **Fallback Provider** ✅
   - Adds to multi-LLM strategy
   - More reliability
   - Geographic diversity

---

## 💰 Pricing

### Free Tier

- ✅ Free trial available
- ✅ Limited API calls per month
- ✅ Perfect for hackathon demo

### Paid Tier

- Pay per token
- Volume discounts available
- Enterprise pricing

---

## 🔒 Security

### Best Practices

1. **Never commit API keys**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use environment variables**
   ```bash
   # backend/.env
   WATSONX_API_KEY=xxx
   WATSONX_PROJECT_ID=xxx
   ```

3. **Rotate keys regularly**
   - Change keys every 90 days
   - Use IBM Cloud IAM

4. **Monitor usage**
   - Track API calls
   - Set up alerts
   - Review logs

---

## 📚 Additional Resources

### Documentation

- IBM watsonx.ai: https://www.ibm.com/watsonx
- API Docs: https://cloud.ibm.com/apidocs/watsonx-ai
- Granite Models: https://www.ibm.com/granite

### Support

- IBM Cloud Support
- watsonx.ai Community
- Hackathon Discord/Slack

---

## ✅ Implementation Checklist

### Setup

- [ ] Get IBM Cloud account
- [ ] Create watsonx.ai instance
- [ ] Create project
- [ ] Get API key from IAM
- [ ] Get Project ID
- [ ] Add to .env file

### Code

- [ ] Create `backend/watsonx.ts`
- [ ] Update `backend/index.ts` (add to providers)
- [ ] Update `backend/routes-devtools.ts` (add endpoints)
- [ ] Install dependencies (if needed)

### Testing

- [ ] Test IAM token generation
- [ ] Test text generation
- [ ] Test code generation
- [ ] Test error handling
- [ ] Test in dev environment

### Documentation

- [ ] Update API_ENDPOINTS.md
- [ ] Update README.md
- [ ] Update .env.example
- [ ] Document model choices

---

## 🚀 Next Steps

1. Get watsonx.ai credentials
2. Implement `backend/watsonx.ts`
3. Update LLM providers
4. Add new endpoints
5. Test integration
6. Update documentation
7. Deploy to production

---

**Status**: Ready for implementation  
**Estimated Time**: 1-2 hours  
**Complexity**: Medium  
**Priority**: High (Hackathon requirement)
