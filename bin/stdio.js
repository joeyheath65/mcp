#!/usr/bin/env node

/**
 * stdio Transport Entry Point
 * 
 * Binary entry point for stdio transport mode.
 * Used when the MCP server is invoked as a command-line tool.
 */

import('../dist/index.js').catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

