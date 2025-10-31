#!/usr/bin/env node

/**
 * MCP Server Entry Point
 * 
 * This file initializes and starts the MCP server with the specified transport mode.
 * Supports both stdio (CLI) and HTTP (SSE) transports.
 */

import { createServer } from './server';
import { Transport } from './types';
import { parseArgs } from './utils/args';

/**
 * Main entry point for the MCP server
 * 
 * Handles:
 * - Argument parsing to determine transport mode
 * - Server initialization
 * - Graceful shutdown
 */
async function main() {
  const args = parseArgs();
  const transport: Transport = args.transport || 'stdio';
  
  const server = createServer({ transport });
  
  // Start the server
  await server.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}

// Run the server
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

