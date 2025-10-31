#!/bin/bash

# MCP Server Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up MCP Server Template..."

# Check for Bun
if command -v bun &> /dev/null; then
    echo "✅ Bun found: $(bun --version)"
else
    echo "⚠️  Bun not found. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
fi

# Check for Node.js (as fallback)
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "⚠️  Node.js not found. Please install Node.js 20+"
fi

# Check for Python
if command -v python3 &> /dev/null; then
    echo "✅ Python found: $(python3 --version)"
else
    echo "⚠️  Python 3 not found. Please install Python 3"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
bun install

# Make scripts executable
chmod +x bin/stdio.js
chmod +x scripts/*.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm start' to start the server in stdio mode"
echo "  2. Run 'npm run start:http' to start in HTTP mode"
echo "  3. See README.md for more information"
echo ""

