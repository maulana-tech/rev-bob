#!/bin/bash

# Get IAM token
echo "Getting IAM token..."
IAM_RESPONSE=$(curl -s -X POST https://iam.cloud.ibm.com/identity/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=l8spFqhAcsdD8GQYr8i3rCYRqRXDBxox6MnMfXXR5YlK")

TOKEN=$(echo $IAM_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get IAM token"
  exit 1
fi

echo "Got IAM token: ${TOKEN:0:50}..."
echo ""

AGENT_ID="cb3cf0d3-1441-43b6-b8f4-05e08642c936"
ENV_ID="28a18158-5812-4155-8894-9c310992020f"
BASE_URL="https://au-syd.watson-orchestrate.cloud.ibm.com"

# Test different endpoint formats
echo "=== Testing Endpoint 1: /api/v1/agents/{id}/messages ==="
curl -s -X POST "$BASE_URL/api/v1/agents/$AGENT_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' | head -100
echo -e "\n"

echo "=== Testing Endpoint 2: /api/v1/agents/{id}/environments/{env}/messages ==="
curl -s -X POST "$BASE_URL/api/v1/agents/$AGENT_ID/environments/$ENV_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' | head -100
echo -e "\n"

echo "=== Testing Endpoint 3: /api/conversation ==="
curl -s -X POST "$BASE_URL/api/conversation" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"message\":\"Hello\"}" | head -100
echo -e "\n"

echo "=== Testing Endpoint 4: /api/v1/conversations ==="
curl -s -X POST "$BASE_URL/api/v1/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\":\"$AGENT_ID\",\"input\":{\"text\":\"Hello\"}}" | head -100
echo -e "\n"

echo "=== Testing Endpoint 5: With environment in path ==="
curl -s -X POST "$BASE_URL/api/agents/$AGENT_ID/environments/$ENV_ID/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' | head -100
echo -e "\n"

echo "=== Testing Endpoint 6: Simple chat endpoint ==="
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\":\"$AGENT_ID\",\"text\":\"Hello\"}" | head -100
echo -e "\n"
