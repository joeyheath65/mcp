# Quick Start Guide

Get your MCP server up and running in minutes!

## Prerequisites

- **Bun 1.0+** or **Node.js 20+**
- **Git**

## Installation

### 1. Clone the Template

```bash
git clone <your-repo-url> my-mcp-server
cd my-mcp-server
```

### 2. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Configure Environment (Optional)

For custom configuration, set up environment variables:

```bash
# Copy the example file
cp env.example .env

# Edit with your settings (optional)
nano .env
```

See [CONFIGURATION.md](./docs/CONFIGURATION.md) for all available options.

### 4. Start the Server

#### Option A: stdio Mode (for CLI/Cursor)

```bash
npm start
```

#### Option B: HTTP Mode (for web apps)

```bash
npm run start:http
```

## Verify It's Working

Once started, you should see:

```
✅ Registered 3 Node.js tools: echo, calculate, system_info
✅ Registered 1 Python tool: python_script (placeholder)
✅ Registered 2 example resources: file://example/*, api://example/*
✅ Registered 2 example prompts: greeting, analyze
🚀 MCP Server started in stdio mode
```

## Connect from Cursor

1. Open Cursor Settings
2. Go to **Features** → **MCP Servers** → **Add new MCP server**
3. Configure:
   - **Name**: `my-mcp-server`
   - **Type**: `command`
   - **Command**: `npm start`
   - **Working Directory**: Path to this project

## Test Your First Tool

Try asking Cursor to use one of the example tools:

```
Can you calculate 15 + 27 using the calculate tool?
```

## Next Steps

- 📖 Read [README.md](./README.md) for detailed documentation
- ⚙️ Configure your server with [CONFIGURATION.md](./docs/CONFIGURATION.md)
- 🏗️ See [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- 🛠️ Customize tools in `src/tools/`
- 🔧 Add resources in `src/resources/`
- 💬 Create prompts in `src/prompts/`

## Development

```bash
# Watch mode with auto-reload
npm run dev        # stdio mode
npm run dev:http   # HTTP mode

# Run checks
npm run lint       # Lint code
npm run type-check # Type check
```

## Docker Deployment

```bash
# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose -f docker-compose.prod.yml up

# Default (both transports)
docker-compose up

# Build specific image
docker build --target production-http -t my-mcp-server .
```

📖 See [docs/DOCKER.md](./docs/DOCKER.md) for complete Docker guide.

## Need Help?

- Check [README.md](./README.md) for full documentation
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- Review [PLANNING.md](./PLANNING.md) for development planning

## Common Issues

### "fastmcp not found"
Run `bun install` or `npm install` again

### Port already in use
Change the port: `npm run start:http -- --port 8080`

### TypeScript errors
Run: `npm run type-check` to see all errors

### Cursor not connecting
Make sure:
- Server is running
- Command path is absolute in Cursor config
- Working directory is set correctly

---

That's it! You're ready to build your MCP server. 🚀

