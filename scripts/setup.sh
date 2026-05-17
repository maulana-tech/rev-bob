#!/bin/bash

# DevTools AI Suite - Setup Script
# This script sets up the development environment

set -e

echo "🚀 DevTools AI Suite - Setup Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "📦 Step 1: Installing Node.js dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    echo -e "${YELLOW}pnpm not found, using npm...${NC}"
    npm install
fi
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
echo ""

echo "🐍 Step 2: Setting up Python backend..."
cd backend

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Found Python $PYTHON_VERSION"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

cd ..
echo ""

echo "⚙️  Step 3: Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your API keys:${NC}"
    echo "   - IBM_BOB_API_KEY"
    echo "   - GITHUB_TOKEN"
else
    echo -e "${YELLOW}.env file already exists${NC}"
fi
echo ""

echo "🗄️  Step 4: Initializing database..."
cd backend
source venv/bin/activate
python -c "from models.database import init_db; init_db(); print('✓ Database initialized')"
cd ..
echo -e "${GREEN}✓ Database initialized${NC}"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm run backend:dev' to start backend"
echo "3. Run 'npm run web:dev' to start frontend"
echo ""
echo "Or use: ./scripts/dev.sh to start both"
echo ""

# Made with Bob
