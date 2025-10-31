#!/bin/bash

# MCP Server Build Script
# Builds the TypeScript project and prepares for deployment

set -e

echo "🔨 Building MCP Server..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/

# Type check
echo "Type checking..."
bun run type-check

# Build
echo "Building TypeScript..."
bun run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "Build output: dist/"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build complete!"

