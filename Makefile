# Makefile for MCP Server Template
# Convenient commands for common tasks

.PHONY: help install dev dev-stdio dev-http start start-stdio start-http build clean lint type-check test docker-build docker-up docker-down setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	bun install

setup: install ## Setup project (install deps and make scripts executable)
	chmod +x bin/stdio.js scripts/*.sh

dev: ## Run in development mode (stdio)
	bun run dev

dev-stdio: ## Run in development mode (stdio)
	bun run dev:stdio

dev-http: ## Run in development mode (http)
	bun run dev:http

start: ## Start server (stdio)
	bun start

start-stdio: ## Start server (stdio)
	bun run start:stdio

start-http: ## Start server (http)
	bun run start:http

build: ## Build TypeScript
	bun run build

clean: ## Clean build artifacts
	bun run clean
	rm -rf node_modules dist

lint: ## Run linter
	bun run lint

type-check: ## Type check without emitting
	bun run type-check

test: type-check lint ## Run all checks

docker-build: ## Build Docker images
	docker build -t mcp-template .

docker-up: ## Start Docker containers
	docker-compose up

docker-down: ## Stop Docker containers
	docker-compose down

.DEFAULT_GOAL := help

