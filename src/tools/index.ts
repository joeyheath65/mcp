/**
 * Tools Registration
 * 
 * This file imports and registers all MCP tools.
 * Add your custom tools here.
 */

import { FastMCP } from 'fastmcp';
import { registerNodeTools } from './node';
import { registerPythonTools } from './python';

/**
 * Register all tools with the MCP server
 */
export function registerTools(mcp: FastMCP): void {
  // Register Node.js tools
  registerNodeTools(mcp);
  
  // Register Python tools
  registerPythonTools(mcp);
  
  // Add your custom tools here
  // Example: registerCustomTools(mcp);
}

