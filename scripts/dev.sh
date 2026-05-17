#!/bin/bash

# DevTools AI Suite - Development Script
# Starts both backend and frontend servers

set -e

echo "🚀 Starting DevTools AI Suite..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting Backend (FastAPI)...${NC}"
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}Starting Frontend (Next.js)...${NC}"
cd packages/web
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo -e "${GREEN}✓ Servers started!${NC}"
echo ""
echo "📍 URLs:"
echo "   Backend API: http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo "   Frontend:    http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for processes
wait

# Made with Bob
