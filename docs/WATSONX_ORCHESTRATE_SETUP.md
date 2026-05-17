# watsonx Orchestrate - Jira & GitLab Agent Setup Guide

**Last Updated**: May 16, 2026  
**Purpose**: Configure Jira and GitLab connections for watsonx Orchestrate agents

---

## Overview

Your watsonx Orchestrate agent shows:
- **Jira**: Configuration Pending - Not connected (12 tools)
- **GitLab**: Configuration Pending - Not connected (1 tool)

This guide will help you fix the "Not connected" status and activate your agent.

---

## Prerequisites

### 1. watsonx Orchestrate Instance
- Access to IBM watsonx Orchestrate dashboard
- Agent created (you already have this)
- Permissions to add integrations

### 2. Jira Access
- Jira instance URL (e.g., `https://your-company.atlassian.net`)
- Jira account with API access
- One of:
  - **Jira API Token** (recommended for Cloud)
  - **Personal Access Token** (for Server/Data Center)
  - **OAuth 2.0 credentials**

### 3. GitLab Access
- GitLab instance URL (e.g., `https://gitlab.com` or self-hosted)
- GitLab account with API access
- **Personal Access Token** with `api` scope

---

## Part 1: Connect Jira to watsonx Orchestrate

### Step 1: Get Jira API Token

**For Jira Cloud (Atlassian):**

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a name: `watsonx-orchestrate`
4. Click **Create**
5. **Copy the token** (you won't see it again)

**For Jira Server/Data Center:**

1. Go to your Jira instance
2. Navigate to **Profile** → **Personal Access Tokens**
3. Create new token with required permissions
4. Copy the token

### Step 2: Configure Jira in watsonx Orchestrate

1. **Open watsonx Orchestrate Dashboard**
   - Go to https://cloud.ibm.com/watsonx/orchestrate
   - Navigate to your agent

2. **Add Jira Connection**
   - Click on **Jira** server (jira_ibm_184bdbd3)
   - Or go to **Integrations** → **Add Integration**
   - Search for "Jira"

3. **Enter Connection Details**

   **Basic Configuration:**
   ```
   Connection Name: Jira Production
   Jira URL: https://your-company.atlassian.net
   Authentication Type: API Token
   ```

   **Authentication:**
   ```
   Email: your-email@company.com
   API Token: [paste your Jira API token]
   ```

   **Alternative: OAuth 2.0** (if your org requires it)
   ```
   Client ID: [from Jira OAuth app]
   Client Secret: [from Jira OAuth app]
   Callback URL: [provided by watsonx Orchestrate]
   ```

4. **Test Connection**
   - Click **Test Connection**
   - Should see: "Connection successful"
   - If fails, check:
     - Jira URL is correct (include https://)
     - API token is valid
     - Email matches Jira account
     - Firewall/network access

5. **Save Configuration**
   - Click **Save** or **Connect**
   - Status should change to: **Connected**

### Step 3: Verify Jira Tools

After connecting, verify these 12 tools are available:

1. **Create Issue in Jira** - Create new Jira issues
2. **Update Issue in Jira** - Modify existing issues
3. **Delete Issue in Jira** - Remove issues
4. **Get All Projects in Jira** - List projects
5. **Get Project by Key in Jira** - Get specific project
6. **Get All Users in Jira** - List users
7. **Search Issues in Jira** - Query issues (JQL)
8. **Get Issue by Key in Jira** - Get specific issue
9. **Add Comment to Issue in Jira** - Comment on issues
10. **Get Comments for Issue in Jira** - Read comments
11. **Get Issue Attachments in Jira** - Get file attachments
12. **Add Attachment to Issue in Jira** - Upload files

If tools don't appear:
- Refresh the page
- Re-authorize the connection
- Check Jira account permissions

---

## Part 2: Connect GitLab to watsonx Orchestrate

### Step 1: Get GitLab Personal Access Token

**For GitLab.com or Self-Hosted:**

1. Go to your GitLab instance
   - GitLab.com: https://gitlab.com/-/profile/personal_access_tokens
   - Self-hosted: `https://your-gitlab.com/-/profile/personal_access_tokens`

2. Create new token:
   ```
   Token name: watsonx-orchestrate
   Expiration: 1 year (or as needed)
   Scopes: 
     ☑ api (full API access)
     ☑ read_api (read-only if preferred)
     ☑ read_repository
   ```

3. Click **Create personal access token**
4. **Copy the token** (you won't see it again)

### Step 2: Configure GitLab in watsonx Orchestrate

1. **Open watsonx Orchestrate Dashboard**
   - Navigate to your agent
   - Click on **GitLab** server (gitlab_ibm_184bdbd3)

2. **Add GitLab Connection**
   - Click **Configure** or **Add Integration**
   - Search for "GitLab"

3. **Enter Connection Details**

   **Basic Configuration:**
   ```
   Connection Name: GitLab Production
   GitLab URL: https://gitlab.com
   Authentication Type: Personal Access Token
   ```

   **For Self-Hosted GitLab:**
   ```
   GitLab URL: https://your-gitlab.company.com
   ```

   **Authentication:**
   ```
   Personal Access Token: [paste your GitLab token]
   ```

4. **Test Connection**
   - Click **Test Connection**
   - Should see: "Connection successful"
   - If fails, check:
     - GitLab URL is correct
     - Token is valid and not expired
     - Token has `api` scope
     - Network/firewall access

5. **Save Configuration**
   - Click **Save** or **Connect**
   - Status should change to: **Connected**

### Step 3: Verify GitLab Tool

After connecting, verify this tool is available:

1. **Get Commits in GitLab** - Retrieve commit history for repositories

If tool doesn't appear:
- Refresh the page
- Re-authorize the connection
- Check GitLab token permissions

---

## Part 3: Test Your Agent

### Test 1: Jira Integration

**Test Create Issue:**

1. Open your agent chat interface
2. Ask: "Create a new Jira issue in project ABC with title 'Test issue' and description 'Testing agent connection'"
3. Expected result: Issue created successfully with issue key (e.g., ABC-123)

**Test Search Issues:**

1. Ask: "Show me all open issues in project ABC"
2. Expected result: List of issues with keys, titles, status

**Test Get Users:**

1. Ask: "List all Jira users"
2. Expected result: List of user accounts

### Test 2: GitLab Integration

**Test Get Commits:**

1. Ask: "Show me recent commits in the main repository"
2. Expected result: List of commits with hash, message, author, date

**Or with specific project:**

1. Ask: "Get commits from project 'devtools-ai-suite' in GitLab"
2. Expected result: Commit history

### Test 3: Combined Workflow

**Test the full workflow:**

1. Ask: "Check GitLab commits for repository X, and if there are changes, create a Jira issue to track deployment"
2. Expected: Agent should:
   - Get commits from GitLab
   - Analyze changes
   - Create Jira issue with details

---

## Part 4: Troubleshooting

### Issue: "Configuration Pending - Not connected"

**Possible causes:**
1. Credentials not entered
2. Wrong URL format
3. Invalid API token
4. Network/firewall blocking requests
5. Insufficient permissions

**Solutions:**

1. **Re-check Credentials**
   ```bash
   # Test Jira API manually
   curl -u your-email@company.com:YOUR_API_TOKEN \
     https://your-company.atlassian.net/rest/api/3/myself
   
   # Test GitLab API manually
   curl --header "PRIVATE-TOKEN: YOUR_TOKEN" \
     https://gitlab.com/api/v4/user
   ```

2. **Verify URLs**
   - Jira: Must include `https://` and no trailing slash
   - GitLab: Use `https://gitlab.com` or your self-hosted URL

3. **Check Permissions**
   - Jira: Account must have access to projects
   - GitLab: Token must have `api` scope

4. **Network Access**
   - Ensure watsonx Orchestrate can reach Jira/GitLab
   - Check firewall rules
   - Verify IP whitelisting if applicable

### Issue: "Authentication Failed"

**For Jira:**
- Verify email matches Jira account
- Regenerate API token
- Try OAuth 2.0 instead of API token

**For GitLab:**
- Check token hasn't expired
- Verify token has correct scopes
- Regenerate token

### Issue: "Tools Not Available"

1. **Refresh Authorization**
   - Disconnect and reconnect
   - Re-enter credentials
   - Save again

2. **Check Permissions**
   - Jira: User must have project permissions
   - GitLab: Token must have repository access

3. **Contact Support**
   - IBM watsonx Orchestrate support
   - Provide error logs from console

---

## Part 5: Security Best Practices

### API Token Management

1. **Rotate Regularly**
   - Change tokens every 90 days
   - Update in watsonx Orchestrate

2. **Use Minimum Permissions**
   - Jira: Only grant necessary project access
   - GitLab: Use `read_api` if read-only access is sufficient

3. **Store Securely**
   - Never commit tokens to Git
   - Use environment variables
   - Use IBM Secrets Manager for production

### Network Security

1. **IP Whitelisting**
   - Get watsonx Orchestrate IP ranges from IBM
   - Add to Jira/GitLab firewall rules

2. **HTTPS Only**
   - Always use `https://` URLs
   - Never use `http://`

3. **Audit Logs**
   - Monitor Jira/GitLab access logs
   - Review watsonx Orchestrate activity logs

---

## Part 6: Integration with DevTools AI Suite

If you want to integrate this watsonx Orchestrate agent with your DevTools AI Suite backend:

### Option 1: Call Agent via watsonx API

```typescript
// backend/watsonx-orchestrate.ts

interface OrchestrateTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

async function callOrchestrateAgent(
  agentId: string,
  message: string
): Promise<string> {
  const token = await getIAMToken();
  
  const response = await fetch(
    `https://api.watsonx.orchestrate.ibm.com/v1/agents/${agentId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: {
          timezone: 'UTC',
        },
      }),
    }
  );
  
  const data = await response.json();
  return data.response;
}
```

### Option 2: Use as External Tool

Add watsonx Orchestrate agent as a tool in your multi-agent system:

```typescript
// backend/agents/orchestrate-agent.ts

export async function createJiraIssue(
  title: string,
  description: string,
  project: string
): Promise<string> {
  const message = `Create a Jira issue in project ${project} with title "${title}" and description "${description}"`;
  return await callOrchestrateAgent(process.env.ORCHESTRATE_AGENT_ID!, message);
}

export async function getGitLabCommits(
  repository: string,
  branch: string = 'main'
): Promise<string> {
  const message = `Get recent commits from GitLab repository ${repository} on branch ${branch}`;
  return await callOrchestrateAgent(process.env.ORCHESTRATE_AGENT_ID!, message);
}
```

### Option 3: Webhook Integration

Set up webhooks from Jira/GitLab to your backend:

```typescript
// backend/routes-webhooks.ts

router.post('/webhooks/jira', async (req, res) => {
  const { issue, changelog } = req.body;
  
  // Process Jira webhook
  console.log('Jira issue updated:', issue.key);
  
  // Trigger analysis in DevTools AI Suite
  await analyzeIssue(issue);
  
  res.json({ status: 'success' });
});

router.post('/webhooks/gitlab', async (req, res) => {
  const { commits, repository } = req.body;
  
  // Process GitLab webhook
  console.log('GitLab commits received:', commits.length);
  
  // Trigger code analysis
  await analyzeCommits(commits);
  
  res.json({ status: 'success' });
});
```

---

## Part 7: Next Steps

### After Successful Connection

1. **Test All Tools**
   - Try each Jira tool (create, update, search, etc.)
   - Try GitLab commits tool
   - Verify responses

2. **Build Workflows**
   - Create custom workflows combining Jira + GitLab
   - Example: "When new commits pushed, create Jira deployment ticket"

3. **Add More Tools**
   - Consider adding GitHub, Slack, email
   - Expand agent capabilities

4. **Monitor Usage**
   - Check agent logs
   - Review API usage
   - Track success rates

### Resources

- **watsonx Orchestrate Docs**: https://www.ibm.com/docs/en/watsonx/orchestrate
- **Jira REST API**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **GitLab API**: https://docs.gitlab.com/ee/api/
- **IBM Support**: https://www.ibm.com/support

---

## Summary

**To fix "Configuration Pending - Not connected":**

1. **Jira**:
   - Get API token from https://id.atlassian.com/manage-profile/security/api-tokens
   - In watsonx Orchestrate, configure Jira connection with URL + email + token
   - Test connection → Save

2. **GitLab**:
   - Get Personal Access Token from GitLab with `api` scope
   - In watsonx Orchestrate, configure GitLab connection with URL + token
   - Test connection → Save

3. **Verify**:
   - Status changes to "Connected"
   - Tools appear in agent
   - Test with sample queries

**If still not working:**
- Check credentials are correct
- Verify network access
- Review error logs in watsonx Orchestrate console
- Contact IBM support

---

**Status after setup**: Both Jira and GitLab should show "Connected" with tools available for use in your agent.
