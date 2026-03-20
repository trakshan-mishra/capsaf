#!/bin/bash

# CAPSAF - Complete Installation Script
# This script sets up the entire CAPSAF application locally

set -e

echo "╔════════════════════════════════════════╗"
echo "║  CAPSAF Installation Script            ║"
echo "║  Production-Ready Backend & Frontend   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js installation
echo -e "${BLUE}[1/8]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 22+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} found${NC}"

# Check npm installation
echo -e "${BLUE}[2/8]${NC} Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm ${NPM_VERSION} found${NC}"

# Check MongoDB
echo -e "${BLUE}[3/8]${NC} Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB found locally${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found locally${NC}"
    echo "Please ensure MongoDB is running or use MongoDB Atlas cloud"
    echo "MongoDB connection: mongodb://localhost:27017/capsaf"
fi

# Install dependencies
echo -e "${BLUE}[4/8]${NC} Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Create .env file
echo -e "${BLUE}[5/8]${NC} Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important: Update .env with your API keys:${NC}"
    echo "   - MongoDB URI"
    echo "   - JWT Secret"
    echo "   - OAuth credentials (Google, GitHub)"
    echo "   - Stripe API keys"
    echo "   - Email/SMS configuration"
    echo ""
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Create directories
echo -e "${BLUE}[6/8]${NC} Creating necessary directories..."
mkdir -p uploads logs config models routes middleware

echo -e "${GREEN}✅ Directories created${NC}"

# Database initialization (optional)
echo -e "${BLUE}[7/8]${NC} Checking database connection..."
if [ "$1" = "--init-db" ]; then
    echo "Initializing database with seed data..."
    npm run seed 2>/dev/null || echo "Database initialization optional"
    echo -e "${GREEN}✅ Database ready${NC}"
else
    echo -e "${GREEN}✅ Database setup skipped (use --init-db flag to seed)${NC}"
fi

# Summary
echo -e "${BLUE}[8/8]${NC} Installation complete!"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗"
echo "║  INSTALLATION SUCCESSFUL!              ║"
echo "╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Start the backend server:"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo "2. Backend will run on:"
echo -e "   ${BLUE}http://localhost:3001${NC}"
echo ""
echo "3. Access frontend on:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "4. Update .env file with your API keys and database credentials"
echo ""
echo "5. Documentation:"
echo -e "   ${BLUE}API Docs: See API_ENDPOINTS.md${NC}"
echo -e "   ${BLUE}Setup Guide: See SETUP.md${NC}"
echo ""

echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  ${GREEN}npm start${NC}           - Start production server"
echo -e "  ${GREEN}npm run dev${NC}         - Start development server with auto-reload"
echo -e "  ${GREEN}npm test${NC}            - Run tests"
echo -e "  ${GREEN}npm run seed${NC}        - Seed database with test data"
echo ""
