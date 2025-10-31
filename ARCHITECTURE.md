# MCP Architecture Documentation

This document provides a detailed explanation of the Model Context Protocol (MCP) architecture and how this template implements it.

## Table of Contents

- [Overview](#overview)
- [MCP Architecture Layers](#mcp-architecture-layers)
- [Protocol Flow](#protocol-flow)
- [Components](#components)
- [Transport Mechanisms](#transport-mechanisms)
- [Data Layer Protocol](#data-layer-protocol)
- [Primitives](#primitives)
- [Implementation Details](#implementation-details)

## Overview

The Model Context Protocol (MCP) is a standardized protocol for connecting AI applications (clients) to external data sources and capabilities (servers). This template implements a complete MCP server following MCP best practices.

### Key Concepts

- **Client**: AI application (e.g., Cursor, Claude Desktop)
- **Server**: This template - provides tools, resources, and prompts
- **Transport**: Communication mechanism (stdio or HTTP/SSE)
- **Protocol**: JSON-RPC 2.0 over transport
- **Primitives**: Tools, Resources, Prompts

## MCP Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Client                           │
│              (Cursor, Claude, etc.)                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Transport Layer                        │
│  ┌────────────────────┐      ┌────────────────────┐    │
│  │  stdio Transport   │      │  HTTP Transport    │    │
│  │   (stdin/stdout)   │      │   (SSE over TCP)   │    │
│  └────────────────────┘      └────────────────────┘    │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Data Layer Protocol                        │
│              (JSON-RPC 2.0)                             │
│  ┌───────────────────────────────────────────────┐     │
│  │  Request/Response/Notification Messages       │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 MCP Server Core                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         FastMCP Framework                       │   │
│  │  - Tool Registry & Execution                   │   │
│  │  - Resource Registry & Loading                 │   │
│  │  - Prompt Registry & Templates                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Tools     │  │  Resources   │  │   Prompts    │
│              │  │              │  │              │
│ - echo       │  │ - file://*   │  │ - greeting   │
│ - calculate  │  │ - api://*    │  │ - analyze    │
│ - system     │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Protocol Flow

### Initialization

1. **Client → Server**: Initialize request
2. **Server → Client**: Capabilities response (tools, resources, prompts)
3. **Client → Server**: Ready to receive requests

### Tool Execution

1. **Client → Server**: `tools/call` request
2. **Server**: Execute tool logic
3. **Server → Client**: `tools/call` response with results

### Resource Access

1. **Client → Server**: `resources/read` request
2. **Server**: Load resource data
3. **Server → Client**: Resource contents response

### Prompt Generation

1. **Client → Server**: `prompts/get` request
2. **Server**: Generate prompt from template
3. **Server → Client**: Prompt messages response

## Components

### 1. Transport Layer

#### stdio Transport (`src/transport/stdio.ts`)

**Purpose**: Local CLI communication

**How it works**:
- Server reads from `stdin`
- Server writes to `stdout`
- JSON-RPC messages over process pipes
- No network required

**Use cases**:
- Cursor integration
- Terminal-based AI
- Local development
- Single-user scenarios

#### HTTP Transport (`src/transport/http.ts`)

**Purpose**: Remote web communication

**How it works**:
- Server listens on TCP port
- Client connects via HTTP
- SSE (Server-Sent Events) for bidirectional communication
- Network-based

**Use cases**:
- Web applications
- Remote access
- Team collaboration
- Multi-user scenarios

### 2. Data Layer Protocol

**Protocol**: JSON-RPC 2.0

**Message Types**:
- **Request**: Method invocation with params
- **Response**: Result or error
- **Notification**: Event without response

**Example Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {
      "message": "Hello, World!"
    }
  }
}
```

**Example Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Hello, World!"
      }
    ]
  }
}
```

### 3. Primitives

#### Tools

**Definition**: Executable functions that perform actions

**Implementation**:
- Registered with FastMCP
- Zod schema for parameters
- Async handler function
- Return structured data

**Example** (`src/tools/node.ts`):
```typescript
mcp.tool({
  name: 'calculate',
  description: 'Performs mathematical calculations',
  parameters: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  handler: async ({ operation, a, b }) => {
    // Tool logic
    return { result: calculateResult(operation, a, b) };
  },
});
```

**Lifecycle**:
1. Client discovers tools via initialization
2. Client calls tool with parameters
3. Server executes and returns result
4. Client handles result

#### Resources

**Definition**: Read-only data sources accessible by URI

**Implementation**:
- URI template for identification
- Async loader function
- MIME type specification
- Content format

**Example** (`src/resources/example.ts`):
```typescript
mcp.resource({
  uri: 'file://example/{filename}',
  name: 'Example File Resource',
  description: 'Reads file content',
  handler: async ({ filename }) => {
    const content = await readFile(filename);
    return {
      contents: [{
        uri: `file://example/${filename}`,
        mimeType: 'text/plain',
        text: content,
      }],
    };
  },
});
```

**Lifecycle**:
1. Client discovers resources via initialization
2. Client requests resource by URI
3. Server loads and returns content
4. Client caches or processes content

#### Prompts

**Definition**: Template-based message generators

**Implementation**:
- Argument specification
- Template rendering
- Message generation
- Format return

**Example** (`src/prompts/example.ts`):
```typescript
mcp.prompt({
  name: 'analyze',
  description: 'Analysis prompt template',
  arguments: [
    { name: 'topic', description: 'Topic to analyze', required: true },
  ],
  handler: async ({ topic }) => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze: ${topic}`,
        },
      }],
    };
  },
});
```

**Lifecycle**:
1. Client discovers prompts via initialization
2. Client requests prompt with arguments
3. Server renders template
4. Client uses in conversation

## Implementation Details

### Server Core (`src/server.ts`)

**Responsibilities**:
- Initialize FastMCP instance
- Register all primitives
- Setup transport layer
- Handle lifecycle events

**Key Methods**:
- `createServer()`: Factory function
- `start()`: Start server with transport
- `stop()`: Graceful shutdown

### Entry Point (`src/index.ts`)

**Responsibilities**:
- Parse CLI arguments
- Determine transport mode
- Initialize server
- Handle signals

**Arguments**:
- `--transport`: stdio or http
- `--port`: HTTP port
- `--host`: HTTP host
- `--help`: Show help

### Type System (`src/types.ts`)

**Definitions**:
- `Transport`: Transport modes
- `ServerConfig`: Configuration
- `ToolContext`: Tool execution context
- `ResourceLoadOptions`: Resource loading

### FastMCP Framework

**Features**:
- Automatic JSON-RPC handling
- Transport abstraction
- Primitive registration
- Error handling

**Benefits**:
- Simpler implementation
- Built-in best practices
- Type safety
- Performance optimized

## Integration Guide

### Connecting from Cursor

**stdio Mode**:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "npm",
      "args": ["start"],
      "env": { "NODE_ENV": "production" }
    }
  }
}
```

**HTTP Mode**:
```json
{
  "mcpServers": {
    "my-server": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

### Extending the Template

1. **Add Tools**: Create files in `src/tools/`
2. **Add Resources**: Create files in `src/resources/`
3. **Add Prompts**: Create files in `src/prompts/`
4. **Register**: Update index files
5. **Test**: Use FastMCP dev mode

## Best Practices

### Error Handling

- Return structured errors
- Don't leak internal details
- Log errors server-side
- Provide helpful messages

### Validation

- Use Zod for all parameters
- Validate before execution
- Type-safe operations
- Graceful failures

### Performance

- Async operations
- Efficient resource loading
- Minimal dependencies
- FastMCP optimization

### Security

- No hardcoded secrets
- Input validation
- Output sanitization
- Transport security

### Documentation

- Clear names
- Comprehensive descriptions
- Example usage
- Parameter documentation

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [FastMCP Documentation](https://github.com/fastmcp)
- [MCP Best Practices](https://modelcontextprotocol.io)

