# MCP Server Monorepo

A collection of Model Context Protocol (MCP) servers built with FastMCP, providing specialized tools for coding assistance and penetration testing.

## Overview

This monorepo contains multiple MCP servers, each providing domain-specific tools that can be used by Claude and other AI assistants:

- **[Coding Server](servers/coding/)**: Code review, testing, and formatting tools
- **[Pentest Server](servers/pentest/)**: Security assessment and penetration testing tools

## Repository Structure

```
mcp/
├── README.md                    # This file - overview and setup guide
├── servers/
│   ├── coding/                  # Coding assistance server
│   │   ├── server.py           # FastMCP server implementation
│   │   ├── requirements.txt    # Python dependencies
│   │   └── README.md           # Server-specific documentation
│   └── pentest/                 # Penetration testing server
│       ├── server.py           # FastMCP server implementation
│       ├── requirements.txt    # Python dependencies
│       └── README.md           # Server-specific documentation
└── shared/                      # Shared utilities (placeholder)
    └── __init__.py
```

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. Clone or navigate to this repository:
```bash
cd mcp
```

2. Set up each server you want to use:

**For Coding Server:**
```bash
cd servers/coding
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**For Pentest Server:**
```bash
cd servers/pentest
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Testing Servers

Test servers individually using the MCP Inspector:

```bash
# Test coding server (stdio)
npx @modelcontextprotocol/inspector python servers/coding/server.py

# Test pentest server (stdio)
npx @modelcontextprotocol/inspector python servers/pentest/server.py

# Test with SSE transport
python servers/coding/server.py --transport sse --port 8000
# Then connect inspector to http://localhost:8000/sse
```

## Transport Options

Each server supports two transport mechanisms:

### stdio (Standard Input/Output)
- **Use for:** Claude Desktop, VS Code, local IDE integrations
- **Pros:** Simple, secure, no network configuration needed
- **Cons:** One client per server instance
- **Default:** Yes

```bash
python servers/coding/server.py
# or explicitly
python servers/coding/server.py --transport stdio
```

### SSE (HTTP with Server-Sent Events)
- **Use for:** Multiple clients, remote access, service deployment
- **Pros:** Multiple concurrent clients, network accessible
- **Cons:** Requires port management, network security considerations
- **Default:** No

```bash
# Coding server (port 8000)
python servers/coding/server.py --transport sse --host 127.0.0.1 --port 8000

# Pentest server (port 8001)
python servers/pentest/server.py --transport sse --host 127.0.0.1 --port 8001

# Bind to all interfaces (use with caution)
python servers/coding/server.py --transport sse --host 0.0.0.0 --port 8000
```

**Security Note:** When using SSE transport, especially for pentest tools, be cautious about binding to 0.0.0.0 or exposing servers to untrusted networks.

## Configuration

### Claude Desktop

To use these servers with Claude Desktop, add them to your configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### stdio Transport (Recommended for Desktop)
```json
{
  "mcpServers": {
    "coding": {
      "command": "python",
      "args": ["/absolute/path/to/mcp/servers/coding/server.py"],
      "env": {}
    },
    "pentest": {
      "command": "python",
      "args": ["/absolute/path/to/mcp/servers/pentest/server.py"],
      "env": {}
    }
  }
}
```

#### SSE Transport (For Shared Services)
If running servers separately as services:

```json
{
  "mcpServers": {
    "coding": {
      "url": "http://localhost:8000/sse"
    },
    "pentest": {
      "url": "http://localhost:8001/sse"
    }
  }
}
```

**Important:**
- Use absolute paths, not relative paths (stdio)
- On Windows, use double backslashes: `C:\\Users\\...\\mcp\\servers\\coding\\server.py`
- For SSE, ensure servers are running before starting Claude Desktop
- Restart Claude Desktop after configuration changes

### VS Code with Claude Extension

If using VS Code or Cursor with Claude Code, add to your settings:

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Search for "Preferences: Open Settings (JSON)"
3. Add MCP server configuration:

#### stdio Transport
```json
{
  "mcp.servers": {
    "coding": {
      "command": "python",
      "args": ["/absolute/path/to/mcp/servers/coding/server.py"]
    },
    "pentest": {
      "command": "python",
      "args": ["/absolute/path/to/mcp/servers/pentest/server.py"]
    }
  }
}
```

#### SSE Transport
```json
{
  "mcp.servers": {
    "coding": {
      "url": "http://localhost:8000/sse"
    },
    "pentest": {
      "url": "http://localhost:8001/sse"
    }
  }
}
```

### Cline (VS Code Extension)

For Cline in VS Code:

1. Open Cline settings
2. Navigate to MCP Servers section
3. Add each server:
   - **stdio**: Command: `python`, Args: `/absolute/path/to/mcp/servers/[server-name]/server.py`
   - **SSE**: URL: `http://localhost:8000/sse` (or appropriate port)

### Continue.dev

For Continue.dev, edit `~/.continue/config.json`:

#### stdio Transport
```json
{
  "mcpServers": {
    "coding": {
      "command": "python",
      "args": ["/absolute/path/to/mcp/servers/coding/server.py"]
    },
    "pentest": {
      "command": "python",
      "args": ["/absolute/path/to/mcp/servers/pentest/server.py"]
    }
  }
}
```

#### SSE Transport
```json
{
  "mcpServers": {
    "coding": {
      "url": "http://localhost:8000/sse"
    },
    "pentest": {
      "url": "http://localhost:8001/sse"
    }
  }
}
```

### Other Platforms

Most MCP-compatible platforms support both transports:

#### stdio Pattern
```json
{
  "server-name": {
    "command": "python",
    "args": ["path/to/server.py"],
    "env": {}
  }
}
```

#### SSE Pattern
```json
{
  "server-name": {
    "url": "http://localhost:PORT/sse"
  }
}
```

## Running Servers as Services

When using SSE transport, you may want to run servers as persistent background services.

### Using screen/tmux (Quick Method)

```bash
# Start in screen
screen -S mcp-coding
python servers/coding/server.py --transport sse --port 8000
# Detach: Ctrl+A, D

# Start in tmux
tmux new -s mcp-coding
python servers/coding/server.py --transport sse --port 8000
# Detach: Ctrl+B, D
```

### Using nohup (Simple Background)

```bash
cd servers/coding
nohup python server.py --transport sse --port 8000 > coding.log 2>&1 &

cd ../pentest
nohup python server.py --transport sse --port 8001 > pentest.log 2>&1 &
```

### Using systemd (Linux)

Create service files in `/etc/systemd/system/`:

**mcp-coding.service:**
```ini
[Unit]
Description=MCP Coding Server
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/absolute/path/to/mcp/servers/coding
ExecStart=/usr/bin/python server.py --transport sse --host 127.0.0.1 --port 8000
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mcp-coding
sudo systemctl start mcp-coding
sudo systemctl status mcp-coding
```

### Using Docker (Advanced)

Create a `Dockerfile` in each server directory:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py .
CMD ["python", "server.py", "--transport", "sse", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t mcp-coding ./servers/coding
docker run -d -p 8000:8000 --name mcp-coding mcp-coding
```

## Server Documentation

Each server has detailed documentation in its respective directory:

- [Coding Server Documentation](servers/coding/README.md)
  - code_review: Automated code review with multiple review types
  - run_tests: Execute tests with pytest, unittest, or nose
  - format_code: Format code with black, autopep8, or isort

- [Pentest Server Documentation](servers/pentest/README.md)
  - port_scan: TCP port scanning and service detection
  - enum_subdomains: Subdomain enumeration via DNS
  - check_cve: CVE database queries (mock implementation)

## Development

### Adding New Servers

1. Create a new directory under `servers/`:
```bash
mkdir servers/new-server
cd servers/new-server
```

2. Create the server structure:
```bash
touch server.py requirements.txt README.md
```

3. Implement your server using FastMCP:
```python
from fastmcp import FastMCP

mcp = FastMCP("server-name")

@mcp.tool()
def example_tool(param: str) -> str:
    """Tool description"""
    return f"Result: {param}"

if __name__ == "__main__":
    mcp.run()
```

4. Document your tools in the README.md
5. Update this main README with the new server

### Adding Tools to Existing Servers

1. Navigate to the server directory
2. Edit `server.py`
3. Add a new function decorated with `@mcp.tool()`
4. Include proper type hints and docstrings
5. Update the server's README.md
6. Test with MCP Inspector

### Shared Utilities

The `shared/` directory is available for common code used across servers:

```python
# In your server.py
import sys
sys.path.append('../..')
from shared import your_utility
```

## Troubleshooting

### Server Not Appearing

1. Check that the path in your config is absolute and correct
2. Verify Python is in your PATH: `python --version`
3. Test the server standalone: `python servers/coding/server.py`
4. Check for syntax errors in the configuration JSON

### Import Errors

1. Ensure you activated the virtual environment
2. Install dependencies: `pip install -r requirements.txt`
3. Check Python version: `python --version` (3.8+ required)

### Permission Errors

1. On Unix systems, make server.py executable: `chmod +x server.py`
2. Ensure you have read permissions on the server directory

### Tool Execution Errors

1. Check tool-specific dependencies (pytest, black, etc.)
2. Review error messages in Claude's output
3. Test tools standalone using MCP Inspector
4. Check file paths are accessible

## Resources

- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## Security Notes

### Coding Server
- Code review tools read files on your system
- Test execution runs code with your user permissions
- Code formatters modify files in-place

### Pentest Server
- Port scanning may trigger IDS/IPS alerts
- Only use on authorized systems
- Subdomain enumeration generates DNS traffic
- Always obtain proper authorization before testing

## Contributing

To contribute to this monorepo:

1. Test your changes with MCP Inspector
2. Update relevant README files
3. Follow existing code style and patterns
4. Add proper error handling and docstrings
5. Document security considerations

## License

[Add your license here]

## Support

For issues or questions:
- Check server-specific README files
- Review troubleshooting section above
- Test with MCP Inspector for debugging
- Check FastMCP documentation

## Version History

### 0.1.0 (Initial Release)
- Coding server with code_review, run_tests, format_code tools
- Pentest server with port_scan, enum_subdomains, check_cve tools
- Basic monorepo structure
- Documentation for all servers
