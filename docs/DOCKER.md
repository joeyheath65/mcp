# Docker Guide

Complete guide for deploying and running the MCP Server using Docker and Docker Compose.

## Quick Start

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up

# Default (stdio + http)
docker-compose up
```

## Docker Images

### Base Image

The template uses **Bun on Alpine Linux** for:
- Small image size (~50MB)
- Fast startup times
- Modern JavaScript runtime
- Low resource usage

### Multi-Stage Build

The Dockerfile uses modern multi-stage builds:

1. **base**: Alpine with Bun and Python
2. **dependencies**: Installs npm packages
3. **builder**: Compiles TypeScript (optional)
4. **production-stdio**: Final stdio image
5. **production-http**: Final HTTP image

## Compose Files

### docker-compose.yml

**Default compose file** with both transports:

```bash
# Start both services
docker-compose up

# Start specific service
docker-compose up mcp-stdio
docker-compose up mcp-http

# Detached mode
docker-compose up -d
```

**Features:**
- Both stdio and HTTP transports
- Volume mounts for development
- Resource limits
- Health checks
- Proper logging

### docker-compose.dev.yml

**Development configuration** with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

**Features:**
- Source files mounted for live editing
- Debug logging enabled
- Fast iteration cycle
- No build step needed

### docker-compose.prod.yml

**Production configuration** optimized for deployment:

```bash
docker-compose -f docker-compose.prod.yml up
```

**Features:**
- No volume mounts (baked-in code)
- Optimized resource limits
- Production logging
- Restart policies
- Security hardened

## Building Images

### Build All Targets

```bash
# Build all stages
docker build --target production-http -t mcp-server:http .
docker build --target production-stdio -t mcp-server:stdio .
```

### Build with Compose

```bash
# Build services
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build mcp-http
```

### Build Optimization

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker-compose build

# Enable inline cache for multi-stage builds
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t mcp-server .
```

## Running Containers

### stdio Transport

```bash
# Run stdio container
docker run -it --rm \
  -v $(pwd)/src:/app/src:ro \
  mcp-template:stdio-latest

# With environment variables
docker run -it --rm \
  -e LOG_LEVEL=debug \
  -v $(pwd)/src:/app/src:ro \
  mcp-template:stdio-latest
```

### HTTP Transport

```bash
# Run HTTP container
docker run -d --rm \
  -p 3001:3001 \
  -e PORT=3001 \
  --name mcp-server \
  mcp-template:http-latest

# Check health
curl http://localhost:3001/health
```

### With Compose

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f mcp-http

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Configuration

### Environment Variables

Set variables in `.env` or compose file:

```yaml
# docker-compose.yml
services:
  mcp-http:
    environment:
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - API_KEY=${API_KEY}
      - DATABASE_URL=${DATABASE_URL}
```

### Secrets Management

**For Production:**

```bash
# Option 1: Docker secrets
echo "my-secret-api-key" | docker secret create api_key -

# Option 2: Environment file
echo "API_KEY=my-secret-api-key" > .env.production
docker-compose --env-file .env.production up

# Option 3: External secrets manager
# AWS Secrets Manager, HashiCorp Vault, etc.
```

## Network Configuration

### Default Network

```bash
# Services communicate on mcp-network
docker-compose up

# Inspect network
docker network inspect mcp-template_mcp-network
```

### Custom Network

```bash
# Create external network
docker network create mcp-network

# Use in compose
networks:
  default:
    external: true
    name: mcp-network
```

## Volume Management

### Development Volumes

```yaml
# Mount source for live editing
volumes:
  - ./src:/app/src
  - ./data:/app/data:ro
```

### Production Volumes

```yaml
# Named volumes for persistence
volumes:
  - mcp-data:/app/data

volumes:
  mcp-data:
    driver: local
```

### Backup Data

```bash
# Backup volume
docker run --rm \
  -v mcp-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm \
  -v mcp-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data
```

## Logging

### Configure Logging

```yaml
services:
  mcp-http:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
```

### View Logs

```bash
# Compose logs
docker-compose logs -f mcp-http
docker-compose logs --tail=100 mcp-http

# Container logs
docker logs mcp-http-server
docker logs --tail=100 -f mcp-http-server
```

### Different Drivers

```yaml
# JSON file (default)
logging:
  driver: "json-file"

# Syslog
logging:
  driver: "syslog"
  options:
    syslog-address: "udp://localhost:514"

# Cloud logging
logging:
  driver: "gcplogs"  # GCP
  driver: "awslogs"  # AWS
  driver: "splunk"   # Splunk
```

## Health Checks

### Built-in Health Checks

The images include health checks:

```bash
# Check health status
docker-compose ps

# Inspect health
docker inspect --format='{{.State.Health.Status}}' mcp-http-server
```

### Custom Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  start_period: 10s
  retries: 3
```

## Resource Limits

### Configure Resources

```yaml
services:
  mcp-http:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Monitor Usage

```bash
# Container stats
docker stats mcp-http-server

# Resource usage
docker exec mcp-http-server top
```

## Security

### Security Features

- ✅ Non-root user (nodejs:1001)
- ✅ Minimal Alpine base image
- ✅ No unnecessary packages
- ✅ Health checks
- ✅ Resource limits

### Additional Hardening

```bash
# Run with security options
docker run --rm \
  --read-only \
  --tmpfs /tmp \
  --security-opt no-new-privileges:true \
  mcp-template:http-latest
```

### Scan Images

```bash
# Scan for vulnerabilities
docker scan mcp-template:http-latest

# Use Trivy
trivy image mcp-template:http-latest
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs mcp-http

# Run with shell access
docker-compose run --rm mcp-stdio sh

# Check environment
docker-compose exec mcp-http env
```

### Port Already in Use

```bash
# Change port
docker-compose up
  -e PORT=8080

# Or kill existing container
docker kill $(docker ps -q --filter "publish=3001")
```

### Build Fails

```bash
# Clean build
docker-compose build --no-cache

# Check Dockerfile syntax
docker build --dry-run .

# View build output
docker-compose build --progress=plain
```

### Health Check Fails

```bash
# Check container logs
docker logs mcp-http-server

# Test manually
docker exec mcp-http-server curl http://localhost:3001/health

# Disable health check temporarily
# Comment out healthcheck in docker-compose.yml
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### GitLab CI

```yaml
# .gitlab-ci.yml
docker:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

## Production Deployment

### Cloud Platforms

**Railway:**
```bash
railway login
railway init
railway up
```

**Render:**
```yaml
# render.yaml
services:
  - type: web
    name: mcp-server
    env: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
```

**Fly.io:**
```bash
fly launch --dockerfile Dockerfile
```

### Kubernetes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: mcp-server
        image: mcp-template:production
        ports:
        - containerPort: 3001
        env:
        - name: PORT
          value: "3001"
```

## Best Practices

1. ✅ Always use multi-stage builds
2. ✅ Run as non-root user
3. ✅ Use .dockerignore
4. ✅ Set resource limits
5. ✅ Configure health checks
6. ✅ Use named networks
7. ✅ Enable BuildKit
8. ✅ Scan for vulnerabilities
9. ✅ Keep images updated
10. ✅ Use specific tags (not latest)

## Additional Resources

- [Docker Docs](https://docs.docker.com)
- [Compose Spec](https://docs.docker.com/compose/compose-file)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security](https://docs.docker.com/engine/security/)

