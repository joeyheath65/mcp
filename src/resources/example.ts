/**
 * Example Resources
 * 
 * Example MCP resources demonstrating various resource patterns.
 * Replace these with your custom resources.
 */

import { FastMCP } from 'fastmcp';

/**
 * Register example resources
 */
export function registerExampleResources(mcp: FastMCP): void {
  // Example: File resource template
  mcp.addResourceTemplate({
    uriTemplate: 'file://example/{filename}',
    name: 'Example File Resource',
    mimeType: 'text/plain',
    arguments: [
      {
        name: 'filename',
        description: 'Name of the file',
        required: true,
      },
    ],
    load: async ({ filename }: { filename: string }) => {
      // In a real implementation, you would read the actual file
      return {
        text: `Example content from file: ${filename}\n\nThis is a placeholder resource.`,
      };
    },
  });

  // Example: API resource template
  mcp.addResourceTemplate({
    uriTemplate: 'api://example/{endpoint}',
    name: 'Example API Resource',
    mimeType: 'application/json',
    arguments: [
      {
        name: 'endpoint',
        description: 'API endpoint',
        required: true,
      },
    ],
    load: async ({ endpoint }: { endpoint: string }) => {
      // In a real implementation, you would fetch from an actual API
      return {
        text: JSON.stringify({
          endpoint,
          data: 'This is example API data',
          timestamp: new Date().toISOString(),
        }, null, 2),
      };
    },
  });

  console.log('✅ Registered 2 example resources: file://example/*, api://example/*');
}

