#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Health Check - DevTools AI Suite                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Frontend
echo -n "Frontend (port 3000): "
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Running${NC}"
    FRONTEND_OK=1
else
    echo -e "${RED}❌ Not running${NC}"
    FRONTEND_OK=0
fi

# Check Backend
echo -n "Backend (port 3001): "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running & Responding${NC}"
    BACKEND_OK=1
else
    echo -e "${RED}❌ Not responding${NC}"
    BACKEND_OK=0
fi

# Check MCP
echo -n "MCP Server (port 3002): "
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}⚠️  Not running (optional)${NC}"
fi

# Check GitHub Auth
echo -n "GitHub Authentication: "
RESPONSE=$(curl -s http://localhost:3001/api/github/me 2>/dev/null)
if echo "$RESPONSE" | grep -q '"authenticated".*true'; then
    USER=$(echo "$RESPONSE" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Working (${USER})${NC}"
    AUTH_OK=1
else
    echo -e "${RED}❌ Not configured${NC}"
    AUTH_OK=0
fi

# Check API Endpoints
echo -n "API Endpoints: "
if curl -s http://localhost:3001/api/devflow/analytics > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
    API_OK=1
else
    echo -e "${RED}❌ Not responding${NC}"
    API_OK=0
fi

echo ""
echo "─────────────────────────────────────────────────────────────────"

# Summary
if [ $FRONTEND_OK -eq 1 ] && [ $BACKEND_OK -eq 1 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "Access application:"
    echo "  Frontend: http://localhost:3000/app/"
    echo "  Backend:  http://localhost:3001"
    echo "  Health:   http://localhost:3001/health"
else
    echo -e "${RED}❌ Some services are not running${NC}"
    echo ""
    echo "To start services:"
    echo "  pnpm dev"
fi

echo "─────────────────────────────────────────────────────────────────"
