# MCP Server Foundation Template

A customizable, production-ready foundation template for building Model Context Protocol (MCP) servers. This template follows MCP best practices and provides a clean, well-structured starting point for creating your own MCP servers.

## 🌟 Features

- **Dual Transport Support**: Both stdio (CLI) and HTTP (SSE) transport modes
- **Comprehensive Structure**: Clear separation of tools, resources, and prompts
- **TypeScript**: Full type safety with modern TypeScript
- **FastMCP**: Built on the FastMCP framework for simplicity and performance
- **Docker Ready**: Complete Docker and docker-compose support
- **Well Documented**: Extensive documentation for usage, customization, and architecture
- **Extensible**: Easy to add custom tools, resources, and prompts
- **Production Ready**: Includes error handling, graceful shutdown, and best practices

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Native Setup](#native-setup)
  - [Docker Setup](#docker-setup)
- [Architecture](#architecture)
- [Customization](#customization)
  - [Adding Tools](#adding-tools)
  - [Adding Resources](#adding-resources)
  - [Adding Prompts](#adding-prompts)
- [Transport Modes](#transport-modes)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ or **Bun** 1.0+
- **Python 3** (optional, for Python tools)
- **Docker** (optional, for containerized deployment)

### Installation

Clone and setup:

```bash
# Clone this template
git clone <your-repo-url>
cd mcp-template

# Install dependencies
bun install  # or npm install, yarn install, pnpm install

# Make binary executable
chmod +x bin/stdio.js
```

## 💻 Usage

### Native Setup

#### stdio Transport (CLI Mode)

Start the server in stdio mode for command-line usage:

```bash
npm start
# or
bun run src/index.ts --transport stdio
```

#### HTTP Transport (Web Mode)

Start the server in HTTP mode for web integration:

```bash
npm run start:http
# or
bun run src/index.ts --transport http --port 3001
```

### Docker Setup

#### Using Docker Compose

Start both stdio and HTTP servers:

```bash
docker-compose up
```

Start only one service:

```bash
# stdio only
docker-compose up mcp-stdio

# http only
docker-compose up mcp-http
```

#### Using Docker Directly

```bash
# Build the image
docker build -t mcp-template .

# Run stdio mode
docker run -it mcp-template

# Run HTTP mode
docker run -p 3001:3001 mcp-template
```

## 🏗️ Architecture

This template implements the Model Context Protocol (MCP) architecture:

```
┌─────────────────┐
│   MCP Client    │  (Cursor, Claude Desktop, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Transport Layer             │
│  ┌──────────┐      ┌──────────┐    │
│  │  stdio   │      │   HTTP   │    │
│  │ (stdin/  │      │   (SSE)  │    │
│  │  stdout) │      │          │    │
│  └──────────┘      └──────────┘    │
└────────┬─────────────────────┬──────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────┐
│      Data Layer Protocol            │
│  (JSON-RPC 2.0 over Transport)     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         MCP Server Core             │
│  ┌────────┐  ┌──────────┐  ┌───────┐│
│  │ Tools  │  │Resources │  │Prompts││
│  └────────┘  └──────────┘  └───────┘│
└─────────────────────────────────────┘
```

**Components:**

1. **Transport Layer**: Handles communication (stdio or HTTP)
2. **Data Layer**: JSON-RPC 2.0 protocol
3. **Server Core**: FastMCP framework
4. **Primitives**: Tools, Resources, Prompts

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🔧 Customization

### Adding Tools

Tools are functions that the AI can call to perform actions.

#### Node.js/TypeScript Tools

Create a new file `src/tools/your_tool.ts`:

```typescript
import { FastMcp } from '@fastmcp/core';
import { z } from 'zod';

export function registerYourTool(mcp: FastMcp): void {
  mcp.tool({
    name: 'your_tool_name',
    description: 'Description of what your tool does',
    parameters: z.object({
      param1: z.string().describe('First parameter'),
      param2: z.number().optional().describe('Optional parameter'),
    }),
    handler: async ({ param1, param2 }) => {
      // Your tool logic here
      return {
        result: `Processed ${param1}`,
      };
    },
  });
}
```

Then register it in `src/tools/index.ts`:

```typescript
import { registerYourTool } from './your_tool';

export function registerTools(mcp: FastMcp): void {
  registerNodeTools(mcp);
  registerPythonTools(mcp);
  registerYourTool(mcp);  // Add this line
}
```

#### Python Tools

For Python tools, you can:

1. **Execute Python scripts**: Use child_process to run Python scripts
2. **Create a Python MCP proxy**: Separate MCP server for Python tools
3. **Use Python execution libraries**: Use libraries like `python-shell`

See `src/tools/python.ts` for implementation patterns.

### Adding Resources

Resources are read-only data sources that the AI can access.

Create a resource in `src/resources/your_resource.ts`:

```typescript
import { FastMcp } from '@fastmcp/core';

export function registerYourResource(mcp: FastMcp): void {
  mcp.resource({
    uri: 'your_scheme://path/{param}',
    name: 'Your Resource Name',
    description: 'Description of your resource',
    handler: async ({ param }: { param: string }) => {
      // Load and return your resource data
      return {
        contents: [
          {
            uri: `your_scheme://path/${param}`,
            mimeType: 'application/json',
            text: JSON.stringify({ data: 'your data' }, null, 2),
          },
        ],
      };
    },
  });
}
```

Register in `src/resources/index.ts`.

### Adding Prompts

Prompts are template-based messages for the AI.

Create a prompt in `src/prompts/your_prompt.ts`:

```typescript
import { FastMcp } from '@fastmcp/core';

export function registerYourPrompt(mcp: FastMcp): void {
  mcp.prompt({
    name: 'your_prompt_name',
    description: 'Description of your prompt',
    arguments: [
      {
        name: 'arg1',
        description: 'First argument',
        required: true,
      },
    ],
    handler: async ({ arg1 }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Your prompt template with ${arg1}`,
            },
          },
        ],
      };
    },
  });
}
```

Register in `src/prompts/index.ts`.

## 🔌 Transport Modes

### stdio Transport

- **Use Case**: CLI tools, local development, Cursor integration
- **Communication**: stdin/stdout
- **Network**: None (local process communication)
- **Access**: Single user, local only
- **Example**: AI assistant in terminal

### HTTP Transport

- **Use Case**: Web apps, remote access, team sharing
- **Communication**: Server-Sent Events (SSE)
- **Network**: TCP/IP over HTTP
- **Access**: Multi-user, remote capable
- **Example**: Shared AI tools for team

## ⚙️ Configuration

Environment variables (see `.env.example`):

- `TRANSPORT`: `stdio` or `http` (default: `stdio`)
- `PORT`: HTTP port (default: `3001`)
- `HOST`: HTTP host binding (default: `0.0.0.0`)
- `LOG_LEVEL`: Logging level (default: `info`)

## 🛠️ Development

### Development Mode

Auto-reload on file changes:

```bash
# stdio dev mode
npm run dev

# http dev mode
npm run dev:http
```

### Scripts

- `npm start` - Start in stdio mode
- `npm run start:http` - Start in HTTP mode
- `npm run dev` - Development mode with auto-reload
- `npm run build` - Build TypeScript
- `npm run lint` - Run ESLint
- `npm run type-check` - Type checking without emit

### Project Structure

```
.
├── src/
│   ├── index.ts           # Entry point
│   ├── server.ts          # Server core
│   ├── types.ts           # Type definitions
│   ├── tools/             # MCP tools
│   │   ├── index.ts
│   │   ├── node.ts        # Node.js tools
│   │   └── python.ts      # Python tools
│   ├── resources/         # MCP resources
│   │   ├── index.ts
│   │   └── example.ts
│   ├── prompts/           # MCP prompts
│   │   ├── index.ts
│   │   └── example.ts
│   ├── transport/         # Transport implementations
│   │   ├── stdio.ts
│   │   └── http.ts
│   └── utils/             # Utilities
│       └── args.ts
├── bin/
│   └── stdio.js           # stdio binary entry point
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── package.json           # Dependencies and scripts
```

See [PLANNING.md](./PLANNING.md) for development planning and [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details.

## 🧪 Testing

### Local Testing

Test your MCP server with FastMCP CLI:

```bash
# Test in development mode
npx @fastmcp/core dev src/index.ts

# Inspect server capabilities
npx @fastmcp/core inspect src/index.ts
```

### Integration Testing

Connect from Cursor:

1. Open Cursor Settings
2. Features → MCP Servers → Add new server
3. Configure:
   - **stdio**: `command: npm start`
   - **http**: `url: http://localhost:3001/sse`

## 🚢 Deployment

### Docker Deployment

```bash
# Build production image
docker build -t your-org/mcp-server .

# Run container
docker run -d -p 3001:3001 --name mcp-server your-org/mcp-server
```

### Cloud Deployment

Deploy to cloud platforms (AWS, GCP, Azure) using Docker or native binaries.

## 📚 Documentation

- **[README.md](./README.md)**: This file - getting started and usage
- **[PLANNING.md](./PLANNING.md)**: Development planning and task management
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed architecture documentation
- **[TASK.md](./TASK.md)**: Current tasks and progress

## 🤝 Contributing

Contributions welcome! See the main project for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [FastMCP GitHub](https://github.com/fastmcp)
- [MCP Specification](https://spec.modelcontextprotocol.io)

## 🙏 Acknowledgments

- Built on [FastMCP](https://github.com/fastmcp/fastmcp)
- Model Context Protocol by Anthropic
- Template inspired by [mcpdotdirect/template-mcp-server](https://github.com/mcpdotdirect/template-mcp-server)
