# Configuration Guide

This guide explains how to configure your MCP server using environment variables.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your settings:
   ```bash
   # Edit .env file
   nano .env  # or use your preferred editor
   ```

3. Load environment variables (automatically handled in most cases):
   ```bash
   # Bun/Node will load .env automatically
   npm start
   ```

## Configuration Categories

### Server Configuration

Control how the server runs:

```bash
# Transport mode: stdio (local CLI) or http (remote)
TRANSPORT=stdio

# Port for HTTP transport
PORT=3001

# Host binding (0.0.0.0 allows external connections)
HOST=0.0.0.0
```

### Logging Configuration

Control logging behavior:

```bash
# Log level: error, warn, info, debug
LOG_LEVEL=info

# Log format: json or text
LOG_FORMAT=text
```

### Security Configuration

Configure authentication and access:

```bash
# API key for client authentication
API_KEY=your-secure-api-key-here

# JWT secret for token signing
JWT_SECRET=your-jwt-secret-key

# Allowed origins for CORS
ALLOWED_ORIGINS=http://localhost:3000,https://example.com
```

### Feature Flags

Enable/disable specific features:

```bash
# Toggle features
ENABLE_TOOLS=true
ENABLE_RESOURCES=true
ENABLE_PROMPTS=true
```

### Tool Configuration

Configure tool execution:

```bash
# Executable paths
PYTHON_PATH=python3
NODE_PATH=node

# Maximum execution time (ms)
MAX_TOOL_EXECUTION_TIME=30000
```

### External Services

Configure integrations:

```bash
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Redis connection
REDIS_URL=redis://localhost:6379

# API keys
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
```

## Using Configuration in Code

### Basic Usage

Import and use the configuration module:

```typescript
import { getConfig } from './config';

const config = getConfig();

console.log(`Server running on port ${config.server.port}`);
```

### Accessing Specific Values

```typescript
import { getConfigValue } from './config';

const port = getConfigValue('server.port');
const apiKey = getConfigValue('security.apiKey');
```

### Validating Configuration

```typescript
import { getConfig, validateConfig } from './config';

const config = getConfig();

// Validate required settings
validateConfig(config);
```

### Using Environment Variables Directly

You can also access environment variables directly:

```typescript
const apiKey = process.env.MY_API_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!apiKey) {
  throw new Error('MY_API_KEY is required');
}
```

## Environment-Specific Configuration

### Development

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
HOT_RELOAD=true
DEBUG=true
```

### Production

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=warn
HOT_RELOAD=false
DEBUG=false
```

### Testing

```bash
# .env.test
NODE_ENV=test
LOG_LEVEL=error
```

## Best Practices

### 1. Never Commit Secrets

❌ **Don't commit** `.env` files:
```bash
# .gitignore should include:
.env
.env.local
.env.*.local
```

✅ **Do commit** `env.example`:
```bash
# This file is safe to commit
env.example
```

### 2. Use Different Files for Different Environments

```bash
# Development
.env.development

# Production
.env.production

# Staging
.env.staging
```

### 3. Validate Configuration on Startup

```typescript
import { getConfig, validateConfig } from './config';

// In your startup code
try {
  const config = getConfig();
  validateConfig(config);
  console.log('Configuration validated');
} catch (error) {
  console.error('Invalid configuration:', error);
  process.exit(1);
}
```

### 4. Provide Sensible Defaults

```typescript
// Good: Provide a default
const port = process.env.PORT || 3001;

// Better: Validate the default
const port = parseInt(process.env.PORT || '3001', 10);
if (isNaN(port) || port <= 0) {
  throw new Error('PORT must be a positive number');
}
```

### 5. Document Required Variables

Always document required environment variables in your README:

```markdown
## Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `API_KEY`: API authentication key
```

## Docker Configuration

### Using Docker Compose

```yaml
# docker-compose.yml
services:
  mcp-server:
    environment:
      - TRANSPORT=http
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.production
```

### Using Dockerfile

```dockerfile
# Dockerfile
ENV TRANSPORT=stdio
ENV LOG_LEVEL=info

# Or use ARG for build-time configuration
ARG BUILD_ENV=production
ENV NODE_ENV=${BUILD_ENV}
```

## Cloud Deployment

### Environment Variables in Cloud Platforms

#### Heroku

```bash
# Set environment variables
heroku config:set API_KEY=value
heroku config:set DATABASE_URL=value

# View all variables
heroku config
```

#### AWS Elastic Beanstalk

```bash
# .ebextensions/environment.config
option_settings:
  aws:elasticbeanstalk:application:environment:
    API_KEY: ${env.API_KEY}
    DATABASE_URL: ${env.DATABASE_URL}
```

#### Google Cloud Run

```bash
# Set environment variables
gcloud run services update my-service \
  --set-env-vars="API_KEY=value,DATABASE_URL=value"
```

#### Railway

```bash
# Set environment variables via dashboard or CLI
railway variables set API_KEY=value
railway variables set DATABASE_URL=value
```

## Common Patterns

### Configuration Per Tool

```typescript
// src/tools/my-tool.ts
export function registerMyTool(mcp: FastMCP): void {
  const apiKey = process.env.MY_TOOL_API_KEY;
  
  if (!apiKey) {
    console.warn('MY_TOOL_API_KEY not set, tool will not be available');
    return;
  }
  
  mcp.addTool({
    name: 'my_tool',
    // ... tool configuration
  });
}
```

### Conditional Feature Loading

```typescript
// src/tools/index.ts
import { getConfig } from '../config';

export function registerTools(mcp: FastMCP): void {
  const config = getConfig();
  
  if (config.features.enableTools) {
    registerNodeTools(mcp);
    registerPythonTools(mcp);
  }
}
```

### External Service Connection

```typescript
// src/services/database.ts
import { getConfigValue } from '../config';

export function connectDatabase() {
  const dbUrl = getConfigValue('database.url');
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL is required');
  }
  
  // Connect to database
  return new Database(dbUrl);
}
```

## Troubleshooting

### "Environment variable not found"

**Problem**: Accessing undefined environment variable.

**Solution**: 
```typescript
// Check if variable exists
const value = process.env.MY_VAR;
if (!value) {
  throw new Error('MY_VAR is required');
}
```

### "Invalid configuration"

**Problem**: Configuration validation fails.

**Solution**: Use the validation function:
```typescript
import { getConfig, validateConfig } from './config';

try {
  const config = getConfig();
  validateConfig(config);
} catch (error) {
  console.error(error.message);
  // Show helpful error message
}
```

### "Environment variables not loading"

**Problem**: Changes to `.env` not reflected.

**Solution**:
1. Restart the server
2. Check file location (should be in project root)
3. Verify file is named `.env` (not `env.example`)

## Additional Resources

- See `env.example` for all available variables
- See `src/config/index.ts` for configuration implementation
- See [README.md](../README.md) for general usage

