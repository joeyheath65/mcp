/**
 * Command Line Argument Parser
 * 
 * Parses command line arguments to configure the MCP server.
 */

import { Transport } from '../types';

/**
 * Parsed command line arguments
 */
export interface ParsedArgs {
  transport?: Transport;
  port?: number;
  host?: string;
  help?: boolean;
}

/**
 * Parse command line arguments
 * 
 * Supported arguments:
 * - --transport: 'stdio' | 'http' (default: stdio)
 * - --port: number (default: 3001 for HTTP)
 * - --host: string (default: 0.0.0.0 for HTTP)
 * - --help: show help message
 */
export function parseArgs(): ParsedArgs {
  const args: ParsedArgs = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    switch (arg) {
      case '--transport':
      case '-t': {
        const transport = argv[++i];
        if (transport === 'stdio' || transport === 'http') {
          args.transport = transport;
        }
        break;
      }
      
      case '--port':
      case '-p': {
        const port = parseInt(argv[++i], 10);
        if (!isNaN(port)) {
          args.port = port;
        }
        break;
      }
      
      case '--host':
      case '-h':
        args.host = argv[++i];
        break;
      
      case '--help':
        showHelp();
        args.help = true;
        break;
    }
  }
  
  return args;
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
MCP Server - Customizable Foundation Template

Usage: npm start [options]

Options:
  --transport, -t <mode>    Transport mode: 'stdio' or 'http' (default: stdio)
  --port, -p <number>       Port number for HTTP transport (default: 3001)
  --host, -h <host>         Host binding for HTTP transport (default: 0.0.0.0)
  --help                    Show this help message

Examples:
  npm start                        # Start in stdio mode
  npm start --transport http       # Start in HTTP mode on port 3001
  npm start -t http -p 8080        # Start in HTTP mode on port 8080

For more information, see README.md
`);
}

