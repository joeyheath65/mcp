/**
 * Prompts Registration
 * 
 * This file imports and registers all MCP prompts.
 * Add your custom prompts here.
 */

import { FastMCP } from 'fastmcp';
import { registerExamplePrompts } from './example';

/**
 * Register all prompts with the MCP server
 */
export function registerPrompts(mcp: FastMCP): void {
  // Register example prompts
  registerExamplePrompts(mcp);
  
  // Add your custom prompts here
  // Example: registerCustomPrompts(mcp);
}

