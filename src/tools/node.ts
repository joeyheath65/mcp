/**
 * Node.js Tools
 * 
 * Example tools implemented in Node.js/TypeScript.
 * Replace these with your custom tools.
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod';

/**
 * Register Node.js tools
 */
export function registerNodeTools(mcp: FastMCP): void {
  // Example: Echo tool
  mcp.addTool({
    name: 'echo',
    description: 'Echoes back the input message',
    parameters: z.object({
      message: z.string().describe('The message to echo'),
      repeat: z.number().optional().default(1).describe('Number of times to repeat'),
    }),
    execute: async ({ message, repeat }) => {
      return `Message: ${message.repeat(repeat || 1)}`;
    },
  });

  // Example: Math calculator tool
  mcp.addTool({
    name: 'calculate',
    description: 'Performs basic mathematical calculations',
    parameters: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('Mathematical operation'),
      a: z.number().describe('First number'),
      b: z.number().describe('Second number'),
    }),
    execute: async ({ operation, a, b }) => {
      let result: number;
      
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          result = a / b;
          break;
      }
      
      return `${a} ${operation} ${b} = ${result}`;
    },
  });

  // Example: System info tool
  mcp.addTool({
    name: 'system_info',
    description: 'Returns system information',
    parameters: z.object({}),
    execute: async () => {
      const info = {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        uptime: process.uptime(),
        memory: {
          total: process.memoryUsage().heapTotal,
          used: process.memoryUsage().heapUsed,
          free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
        },
      };
      return JSON.stringify(info, null, 2);
    },
  });

  console.log('✅ Registered 3 Node.js tools: echo, calculate, system_info');
}

