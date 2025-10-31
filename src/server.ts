/**
 * MCP Server Core
 * 
 * This file contains the main server implementation using FastMCP.
 * It handles server initialization, tool/resource/prompt registration,
 * and transport management.
 */

import { FastMCP } from 'fastmcp';
import { ServerConfig } from './types';
import { registerTools } from './tools';
import { registerResources } from './resources';
import { registerPrompts } from './prompts';

/**
 * Server interface
 */
export interface McpServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  getFastMcp(): FastMCP;
}

/**
 * Server class implementation
 */
class Server implements McpServer {
  private mcp: FastMCP;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.mcp = new FastMCP({
      name: 'MCP Foundation Template',
      version: '1.0.0',
    });
    
    // Register tools, resources, and prompts
    registerTools(this.mcp);
    registerResources(this.mcp);
    registerPrompts(this.mcp);
  }

  getFastMcp(): FastMCP {
    return this.mcp;
  }

  /**
   * Start the server with the configured transport
   */
  async start(): Promise<void> {
    try {
      if (this.config.transport === 'http') {
        await this.mcp.start({
          transportType: 'httpStream',
          httpStream: {
            port: this.config.port || 3001,
          },
        });
        console.log(`🚀 MCP Server started in HTTP mode on port ${this.config.port || 3001}`);
      } else {
        await this.mcp.start({
          transportType: 'stdio',
        });
        console.log('🚀 MCP Server started in stdio mode');
      }
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the server gracefully
   */
  async stop(): Promise<void> {
    try {
      console.log('MCP Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error);
      throw error;
    }
  }
}

/**
 * Create a new MCP server instance
 */
export function createServer(config: ServerConfig): McpServer {
  return new Server(config);
}

