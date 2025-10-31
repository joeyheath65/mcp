# syntax=docker/dockerfile:1
# MCP Server Dockerfile
# Modern multi-stage build supporting both stdio and HTTP transport modes

# ==============================================================================
# Base Stage
# ==============================================================================
FROM oven/bun:1-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies (Python for Python tools, curl for health checks)
# Using apk for Alpine
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# ==============================================================================
# Dependencies Stage
# ==============================================================================
FROM base AS dependencies

# Copy package files for dependency installation
COPY --chown=nodejs:nodejs package.json bun.lock ./

# Install production dependencies only
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production=false

# ==============================================================================
# Builder Stage
# ==============================================================================
FROM base AS builder

# Copy all dependencies
COPY --chown=nodejs:nodejs --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Build TypeScript (if build is needed)
# Note: FastMCP runs TypeScript directly in development, but we build for production
RUN if [ -f "tsconfig.json" ]; then \
        bun run build || true; \
    fi

# ==============================================================================
# Production - stdio Transport
# ==============================================================================
FROM base AS production-stdio

# Copy dependencies
COPY --chown=nodejs:nodejs --from=dependencies /app/node_modules ./node_modules

# Copy built files if they exist
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Copy source files (needed for runtime)
COPY --chown=nodejs:nodejs . .

# Health check (stdio doesn't need HTTP, so use process check)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD pgrep -f "src/index.ts" || exit 1

# Run as non-root user
USER nodejs

# Default command for stdio transport
ENTRYPOINT ["bun", "run", "src/index.ts", "--transport", "stdio"]

# ==============================================================================
# Production - HTTP Transport
# ==============================================================================
FROM base AS production-http

# Copy dependencies
COPY --chown=nodejs:nodejs --from=dependencies /app/node_modules ./node_modules

# Copy built files if they exist
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Copy source files
COPY --chown=nodejs:nodejs . .

# Expose HTTP port
EXPOSE 3001

# Health check for HTTP
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Run as non-root user
USER nodejs

# Default command for HTTP transport
ENTRYPOINT ["bun", "run", "src/index.ts", "--transport", "http"]

# ==============================================================================
# Default Production Stage
# ==============================================================================
FROM production-stdio AS production
