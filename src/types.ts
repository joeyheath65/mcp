/**
 * Type Definitions for MCP Server
 * 
 * This file contains type definitions used throughout the MCP server.
 */

/**
 * Transport types supported by the MCP server
 */
export type Transport = 'stdio' | 'http';

/**
 * Server configuration options
 */
export interface ServerConfig {
  transport: Transport;
  port?: number;
  host?: string;
  logLevel?: LogLevel;
}

/**
 * Logging levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Tool execution context
 */
export interface ToolContext {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Resource loading options
 */
export interface ResourceLoadOptions {
  id: string;
  context?: ToolContext;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

