# Contributing to MCP Server Foundation Template

Thank you for your interest in contributing to the MCP Server Foundation Template! This document provides guidelines for contributing.

## How to Contribute

This is a template repository, which means contributions should focus on improving the template itself rather than adding specific functionality.

### Areas for Contribution

1. **Documentation**: Improve clarity, add examples, fix errors
2. **Example Code**: Add more comprehensive examples of tools, resources, prompts
3. **Best Practices**: Add security, performance, or design pattern improvements
4. **Developer Experience**: Improve tooling, scripts, or setup processes
5. **Templates**: Add templates for common use cases

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `make install` or `bun install`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Follow existing code style
- Use TypeScript strict mode
- Run `make lint` and `make type-check` before committing
- Keep files under 500 lines
- Add JSDoc comments for public APIs

### Testing

Before submitting a PR:

```bash
make test  # Runs type-check and lint
make build # Builds the project
```

### Documentation

- Update relevant documentation files
- Add examples where helpful
- Keep architecture diagrams current
- Update CHANGELOG.md

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Example:
```
feat: add WebSocket transport support
```

### Pull Request Process

1. Update CHANGELOG.md with your changes
2. Ensure tests pass
3. Update documentation as needed
4. Submit PR with clear description
5. Link any related issues

### Questions?

If you have questions or need help, please open an issue for discussion.

Thank you for contributing!

