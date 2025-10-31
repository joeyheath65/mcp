# MCP Server Dockerfile
# Supports both stdio and HTTP transport modes

# Use Bun as the base image for fast performance
FROM oven/bun:1 AS base
WORKDIR /app

# Install Python for Python tool support
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Dependencies stage
FROM base AS dependencies
COPY package.json ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN bun run build || true

# Production stage for stdio
FROM base AS production-stdio
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY . .

# Default command for stdio transport
CMD ["bun", "run", "src/index.ts", "--transport", "stdio"]

# Production stage for HTTP
FROM base AS production-http
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY . .

# Expose HTTP port
EXPOSE 3001

# Default command for HTTP transport
CMD ["bun", "run", "src/index.ts", "--transport", "http"]

# Default production stage (stdio)
FROM production-stdio AS production

