/**
 * Resources Registration
 * 
 * This file imports and registers all MCP resources.
 * Add your custom resources here.
 */

import { FastMCP } from 'fastmcp';
import { registerExampleResources } from './example';

/**
 * Register all resources with the MCP server
 */
export function registerResources(mcp: FastMCP): void {
  // Register example resources
  registerExampleResources(mcp);
  
  // Add your custom resources here
  // Example: registerCustomResources(mcp);
}

