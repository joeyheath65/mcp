/**
 * Example Prompts
 * 
 * Example MCP prompts demonstrating prompt template patterns.
 * Replace these with your custom prompts.
 */

import { FastMCP } from 'fastmcp';

/**
 * Register example prompts
 */
export function registerExamplePrompts(mcp: FastMCP): void {
  // Example: Greeting prompt
  mcp.addPrompt({
    name: 'greeting',
    description: 'Generates a personalized greeting',
    arguments: [
      {
        name: 'name',
        description: 'Name of the person to greet',
        required: true,
      },
      {
        name: 'context',
        description: 'Additional context for the greeting',
        required: false,
      },
    ],
    load: async ({ name, context }) => {
      let greeting = `Hello, ${name}!`;
      
      if (context) {
        greeting += ` ${context}`;
      }
      
      return greeting;
    },
  });

  // Example: Analysis prompt
  mcp.addPrompt({
    name: 'analyze',
    description: 'Provides a structured analysis prompt',
    arguments: [
      {
        name: 'topic',
        description: 'Topic to analyze',
        required: true,
      },
      {
        name: 'framework',
        description: 'Analysis framework to use',
        required: false,
      },
    ],
    load: async ({ topic, framework }) => {
      const frameworkText = framework || 'general';
      
      return `Please provide a ${frameworkText} analysis of: ${topic}\n\nConsider:\n1. Key points\n2. Strengths\n3. Weaknesses\n4. Recommendations`;
    },
  });

  console.log('✅ Registered 2 example prompts: greeting, analyze');
}

