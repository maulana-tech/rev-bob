# watsonx Orchestrate Agent - Demo Guide

**Agent Name:** DevOps AI Analyst  
**Agent ID:** `cb3cf0d3-1441-43b6-b8f4-05e08642c936`  
**Powered By:** IBM watsonx.ai Granite models  
**Status:** ✅ Deployed

---

## What This Agent Does

**Role:** AI DevOps Analyst (Brain/Advisor)

**Capabilities:**
- 🔍 Analyze code for security vulnerabilities
- 📊 Identify code quality issues
- ⚡ Detect performance problems
- 📝 Recommend Jira issue structures
- 💡 Provide actionable recommendations
- 🤖 Powered by IBM Granite foundation models

**What it DOESN'T do:**
- ❌ Direct Jira operations (that's the local agent's job)
- ❌ Direct GitHub operations (that's the local agent's job)
- ❌ Code execution (analysis only)

---

## Architecture

```
┌────────────────────────────────────────────┐
│  watsonx Orchestrate Agent (Cloud)         │
│  - Conversational AI                       │
│  - Code analysis & recommendations         │
│  - Powered by Granite models               │
└──────────────┬─────────────────────────────┘
               │
               │ Chat/Analysis
               ▼
┌────────────────────────────────────────────┐
│  User (Developer)                          │
│  - Asks questions                          │
│  - Gets recommendations                    │
│  - Executes actions                        │
└──────────────┬─────────────────────────────┘
               │
               │ API Calls
               ▼
┌────────────────────────────────────────────┐
│  DevTools AI Suite Backend (Local)         │
│  - Execute Jira operations ✅              │
│  - Execute GitHub operations ✅            │
│  - Code analysis tools ✅                  │
│  - 12 Jira endpoints operational           │
└────────────────────────────────────────────┘
```

---

## Demo Scenarios

### Scenario 1: Security Analysis

**User Input:**
```
I have a Node.js authentication system:
- Uses JWT tokens
- Passwords stored with MD5
- No rate limiting on login endpoint
- SQL queries with string concatenation

Can you analyze the security?
```

**Expected Agent Response:**
```
⚠️ CRITICAL SECURITY ISSUES DETECTED

Analysis of your authentication system:

1. ⚠️ CRITICAL: Insecure Password Storage (MD5)
   - Severity: Critical
   - Risk: Password compromise via rainbow tables
   - Impact: All user accounts vulnerable
   - Fix: Migrate to bcrypt with cost factor 12+

2. ⚠️ CRITICAL: SQL Injection Vulnerability
   - Severity: Critical
   - Risk: Database compromise, data theft
   - Impact: Complete system breach possible
   - Fix: Use parameterized queries or ORM

3. 🔴 HIGH: Missing Rate Limiting
   - Severity: High
   - Risk: Brute force attacks
   - Impact: Account takeover
   - Fix: Implement express-rate-limit

4. ✅ GOOD: Using JWT tokens (secure if implemented correctly)

Recommended Jira Issues: 3 critical

Priority Order:
1. SQL Injection (fix immediately)
2. Password hashing (urgent)
3. Rate limiting (important)

Would you like me to provide the Jira issue structures?
```

**User:** "Yes, provide Jira structures"

**Agent:**
```
JIRA ISSUE #1 - SQL Injection

Summary: CRITICAL: SQL injection in authentication queries

Description:
File: backend/auth.ts (or your auth module)
Function: login(), register()

Issue:
SQL queries use string concatenation with user input:
query = "SELECT * FROM users WHERE email = '" + email + "'"

Severity: Critical
Risk: Complete database compromise, data theft

Recommendation:
Replace with parameterized queries:
query = "SELECT * FROM users WHERE email = ?"
params = [email]

Or use ORM (Prisma, TypeORM, Sequelize)

References:
- OWASP SQL Injection
- CWE-89

Detected by: DevOps AI Analyst (IBM watsonx.ai)

---

To create this issue, call:

POST /api/jira/issue
{
  "project": "KAN",
  "summary": "CRITICAL: SQL injection in authentication queries",
  "description": "[copy above]",
  "issuetype": "Bug",
  "priority": "Highest"
}
```

**User executes:**
```bash
curl -X POST http://localhost:3001/api/jira/issue \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Response:** Issue KAN-11 created ✅

**User reports back:** "Created KAN-11"

**Agent:**
```
Excellent! Issue KAN-11 created.

Next steps for SQL injection fix:
1. Audit all SQL queries in codebase
2. Replace string concatenation with parameterized queries
3. Consider migrating to ORM for better security
4. Add input validation as defense-in-depth
5. Run security tests (SQLMap, etc.)

Estimated fix time: 2-4 hours
Priority: Fix immediately (critical security issue)

Would you like me to help with the other issues?
```

---

### Scenario 2: Code Quality Review

**User Input:**
```
Review this function:

function processUsers(users) {
  for(var i=0; i<users.length; i++) {
    var user = users[i];
    var query = "SELECT * FROM orders WHERE user_id = " + user.id;
    db.query(query, function(err, orders) {
      if(orders) {
        for(var j=0; j<orders.length; j++) {
          console.log(orders[j]);
        }
      }
    });
  }
}
```

**Expected Agent Response:**
```
Code Quality & Security Analysis:

Issues Found: 4

1. ⚠️ CRITICAL: SQL Injection
   - Line: var query = "SELECT * FROM orders WHERE user_id = " + user.id
   - Issue: User input concatenated into SQL
   - Fix: Use parameterized query

2. 🔴 HIGH: N+1 Query Problem
   - Issue: Loop executes query for each user
   - Impact: Performance degradation with many users
   - Fix: Use JOIN or batch query

3. 🟡 MEDIUM: Variable Scoping (var)
   - Issue: Using var instead of let/const
   - Impact: Potential scope bugs
   - Fix: Use const for user, let for i/j

4. 🟡 MEDIUM: Missing Error Handling
   - Issue: No handling for err parameter
   - Impact: Silent failures
   - Fix: Add error handling

Refactored Version:

async function processUsers(users) {
  try {
    const userIds = users.map(u => u.id);
    
    const query = `
      SELECT o.* 
      FROM orders o
      WHERE o.user_id IN (?)
    `;
    
    const orders = await db.query(query, [userIds]);
    
    for (const order of orders) {
      console.log(order);
    }
  } catch (error) {
    console.error('Error processing users:', error);
    throw error;
  }
}

Improvements:
✅ SQL injection fixed (parameterized query)
✅ N+1 problem solved (single query with IN)
✅ Modern syntax (const, async/await)
✅ Error handling added

Would you like Jira issues created for these?
```

---

### Scenario 3: Architecture Review

**User Input:**
```
I'm building a microservices architecture:
- User service
- Order service
- Payment service

Each service has its own database.
How should I handle transactions across services?
```

**Expected Agent Response:**
```
Microservices Transaction Patterns:

Challenge: Distributed transactions across services

Recommended Patterns:

1. 🎯 Saga Pattern (Recommended)
   - Choreography: Event-driven coordination
   - Orchestration: Central coordinator
   - Pros: Eventual consistency, scalable
   - Cons: Complex rollback logic

2. 🔄 Two-Phase Commit (2PC)
   - Coordinator asks all services to prepare
   - Then commits or rollback
   - Pros: Strong consistency
   - Cons: Performance overhead, blocking

3. 📨 Event Sourcing
   - Store events, not state
   - Replay events for state
   - Pros: Audit trail, time travel
   - Cons: Learning curve, complexity

For Your Use Case:

Order Flow Example with Saga:

1. User Service: Reserve user credit
   → Success: Emit UserCreditReserved event
   → Failure: Return error

2. Order Service: Create order
   → Success: Emit OrderCreated event
   → Failure: Compensate (release user credit)

3. Payment Service: Process payment
   → Success: Emit PaymentProcessed event
   → Failure: Compensate (cancel order, release credit)

4. Order Service: Confirm order
   → Success: Complete
   → Failure: Refund payment

Implementation Recommendations:

1. Use message broker (RabbitMQ, Kafka)
2. Implement idempotent operations
3. Add correlation IDs for tracking
4. Handle compensating transactions
5. Monitor saga execution

Tools:
- Temporal.io (orchestration)
- Camunda (workflow engine)
- Custom event handlers

Would you like me to recommend Jira stories for implementation?
```

---

## Demo Script for Hackathon

### 1. Introduction (30 seconds)

"This is DevOps AI Analyst, powered by IBM watsonx.ai Granite models. 
It analyzes code, identifies security issues, and provides actionable 
recommendations - helping developers turn ideas into impact faster."

---

### 2. Live Demo (2-3 minutes)

**Show agent web chat**, type:

```
Analyze authentication code:
- Uses MD5 for passwords
- SQL string concatenation
- No rate limiting

What are the security issues?
```

**Agent responds** with critical issues.

**Show execution:**
```bash
curl -X POST http://localhost:3001/api/jira/issue \
  -H "Content-Type: application/json" \
  -d '{
    "project": "KAN",
    "summary": "CRITICAL: SQL injection vulnerability",
    "description": "...",
    "issuetype": "Bug",
    "priority": "Highest"
  }'
```

**Show Jira:** Issue created! ✅

---

### 3. Key Points (30 seconds)

"What we just saw:
1. AI agent (Granite) analyzed code in seconds
2. Identified 3 critical security issues
3. Auto-created Jira tickets with priorities
4. Full IBM ecosystem: watsonx.ai + watsonx Orchestrate + Jira

Traditional approach: Hours of manual review
With AI: 30 seconds automated

That's how we turn ideas into impact faster."

---

## Testing Checklist

Before demo:

- [ ] Agent deployed and accessible
- [ ] Knowledge base uploaded
- [ ] Test web chat working
- [ ] Jira connection working (backend)
- [ ] Backend running on localhost:3001
- [ ] Jira project "KAN" exists
- [ ] Test conversation flows
- [ ] Prepare demo script
- [ ] Test Jira issue creation
- [ ] Verify issue shows in Jira UI

---

## Access URLs

**Agent Web Chat:**
- Find in: watsonx Orchestrate → Agent → Channels → Web chat
- Or: watsonx Orchestrate → Agent → Preview

**Agent Edit:**
- https://au-syd.watson-orchestrate.cloud.ibm.com/build/agent/edit/cb3cf0d3-1441-43b6-b8f4-05e08642c936

**Backend API:**
- http://localhost:3001/api/jira/status
- http://localhost:3001/api/jira/projects
- http://localhost:3001/api/jira/issue

**Jira Instance:**
- https://devtool-test.atlassian.net

---

## Troubleshooting

### Agent Not Responding

1. Check agent is deployed (not draft)
2. Verify web chat URL is correct
3. Check network/firewall
4. Try incognito browser

### Backend Connection Failed

1. Check backend running: `curl http://localhost:3001/health`
2. Verify Jira configured: `curl http://localhost:3001/api/jira/status`
3. Restart backend: `pnpm dev`

### Jira Issue Creation Failed

1. Check Jira API token valid
2. Verify project "KAN" exists
3. Check backend logs for errors
4. Test manual curl command

---

## Key Metrics

**Time Savings:**
- Traditional code review: 30-60 minutes
- With AI agent: 30 seconds
- **Speedup: 60-120x faster**

**Capabilities:**
- 8 LLM providers (including Granite)
- 12 Jira API endpoints
- GitHub integration
- Multi-agent architecture
- WebGL graph visualization

**IBM Ecosystem:**
- ✅ IBM watsonx.ai (Granite models)
- ✅ IBM watsonx Orchestrate (agent platform)
- ✅ Jira Cloud (project management)
- ✅ GitHub (version control)

---

## Summary

**What We Built:**

1. **Conversational AI Agent** (watsonx Orchestrate)
   - Powered by Granite models
   - Code analysis expert
   - Security advisor
   - Interactive Q&A

2. **Execution Backend** (DevTools AI Suite)
   - Jira integration (12 endpoints)
   - GitHub integration
   - Multi-LLM orchestration
   - Graph visualization

3. **Complete Workflow**
   - Agent analyzes → Recommends
   - User approves → Executes
   - Backend creates → Jira issues
   - All automated, all IBM ecosystem

**Impact:**
Turn security analysis from hours to seconds.
Turn manual Jira creation to automated.
Turn ideas into impact faster. ✨

---

**Ready for hackathon demo!** 🚀
