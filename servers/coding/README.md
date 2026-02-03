# Coding MCP Server

A FastMCP server providing coding assistance tools for code review, testing, and formatting.

## Available Tools

### 1. code_review
Perform automated code reviews on files with multiple review types.

**Parameters:**
- `file_path` (str, required): Path to the file to review
- `review_type` (str, optional): Type of review - "general" (default), "security", "performance", or "style"

**Example:**
```python
code_review("src/main.py", "security")
```

**Features:**
- Line length checks (120 character limit)
- TODO/FIXME comment detection
- Basic security pattern detection (eval, exec, os.system, etc.)
- File statistics

### 2. run_tests
Execute tests using popular Python testing frameworks.

**Parameters:**
- `test_path` (str, required): Path to test file or directory
- `test_framework` (str, optional): Testing framework - "pytest" (default), "unittest", or "nose"

**Example:**
```python
run_tests("tests/", "pytest")
```

**Features:**
- Supports pytest, unittest, and nose
- 60-second timeout for test execution
- Captures both stdout and stderr
- Returns exit codes and full output

### 3. format_code
Format Python code using popular formatters.

**Parameters:**
- `file_path` (str, required): Path to file or directory to format
- `formatter` (str, optional): Code formatter - "black" (default), "autopep8", or "isort"
- `check_only` (bool, optional): If True, only check formatting without modifying files

**Example:**
```python
format_code("src/", "black", check_only=False)
```

**Features:**
- Supports black, autopep8, and isort
- Check-only mode for CI/CD pipelines
- 30-second timeout
- In-place file modification or diff output

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Install formatters and testing tools:
```bash
pip install black autopep8 isort pytest
```

## Running the Server

The server supports two transport mechanisms: stdio (default) and HTTP/SSE.

### stdio Transport (Default)

Best for: Claude Desktop, VS Code, local IDE integrations

```bash
# Run with stdio (default)
python server.py

# Or explicitly specify stdio
python server.py --transport stdio
```

### HTTP/SSE Transport

Best for: Multiple clients, remote access, service deployment

```bash
# Run with HTTP/SSE on default port (8000)
python server.py --transport sse

# Custom host and port
python server.py --transport sse --host 0.0.0.0 --port 9000
```

**SSE Options:**
- `--host`: Host to bind to (default: 127.0.0.1)
- `--port`: Port to bind to (default: 8000)

### Testing with MCP Inspector

```bash
# Test stdio transport
npx @modelcontextprotocol/inspector python server.py

# Test SSE transport
python server.py --transport sse --port 8000
# Then connect inspector to http://localhost:8000/sse
```

## Configuration

### Claude Desktop (stdio)
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "coding": {
      "command": "python",
      "args": ["/path/to/mcp/servers/coding/server.py"],
      "env": {}
    }
  }
}
```

### Claude Desktop (SSE)
If running as a separate service:

```json
{
  "mcpServers": {
    "coding": {
      "url": "http://localhost:8000/sse"
    }
  }
}
```

### VS Code / Cursor (stdio)
Add to your MCP settings:

```json
{
  "mcp.servers": {
    "coding": {
      "command": "python",
      "args": ["/path/to/mcp/servers/coding/server.py"]
    }
  }
}
```

### VS Code / Cursor (SSE)
If using a remote or shared server:

```json
{
  "mcp.servers": {
    "coding": {
      "url": "http://localhost:8000/sse"
    }
  }
}
```

## Development

### Adding New Tools
1. Add a new function decorated with `@mcp.tool()`
2. Include proper type hints and docstrings
3. Add error handling
4. Update this README with tool documentation

### Testing
Test individual tools using the MCP Inspector or by importing the server module in Python.

## Notes

- All file paths should be absolute or relative to the execution directory
- Tools include timeout limits to prevent hanging
- External tools (pytest, black, etc.) must be installed separately
- Error messages are returned as strings for easy debugging
