#!/usr/bin/env python3
"""
MCP Coding Server

A FastMCP server providing coding assistance tools including code review,
testing, and formatting capabilities.

Supports both stdio and HTTP/SSE transports.
"""

from fastmcp import FastMCP
import subprocess
import sys
import argparse
from pathlib import Path
from typing import Optional

# Initialize FastMCP server
mcp = FastMCP("coding")


@mcp.tool()
def code_review(file_path: str, review_type: str = "general") -> str:
    """
    Perform a code review on the specified file.

    Args:
        file_path: Path to the file to review
        review_type: Type of review - "general", "security", "performance", or "style"

    Returns:
        Review results and suggestions
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return f"Error: File '{file_path}' not found"

        if not path.is_file():
            return f"Error: '{file_path}' is not a file"

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        file_ext = path.suffix

        # Basic analysis
        issues = []

        if review_type in ["general", "style"]:
            # Check for long lines
            for i, line in enumerate(lines, 1):
                if len(line) > 120:
                    issues.append(f"Line {i}: Line exceeds 120 characters ({len(line)} chars)")

            # Check for TODO/FIXME comments
            for i, line in enumerate(lines, 1):
                if 'TODO' in line or 'FIXME' in line:
                    issues.append(f"Line {i}: Found TODO/FIXME comment")

        if review_type in ["general", "security"]:
            # Basic security checks
            security_patterns = ['eval(', 'exec(', 'os.system(', 'subprocess.call(']
            for i, line in enumerate(lines, 1):
                for pattern in security_patterns:
                    if pattern in line:
                        issues.append(f"Line {i}: Potential security risk - {pattern}")

        result = f"Code Review for {file_path} ({review_type})\n"
        result += f"Total lines: {len(lines)}\n"
        result += f"File type: {file_ext}\n\n"

        if issues:
            result += "Issues found:\n"
            result += "\n".join(f"  - {issue}" for issue in issues)
        else:
            result += "No issues found!"

        return result

    except Exception as e:
        return f"Error performing code review: {str(e)}"


@mcp.tool()
def run_tests(test_path: str, test_framework: str = "pytest") -> str:
    """
    Run tests using the specified testing framework.

    Args:
        test_path: Path to test file or directory
        test_framework: Testing framework to use - "pytest", "unittest", or "nose"

    Returns:
        Test execution results
    """
    try:
        path = Path(test_path)
        if not path.exists():
            return f"Error: Test path '{test_path}' not found"

        commands = {
            "pytest": ["pytest", test_path, "-v"],
            "unittest": ["python", "-m", "unittest", "discover", test_path],
            "nose": ["nosetests", test_path, "-v"]
        }

        if test_framework not in commands:
            return f"Error: Unsupported test framework '{test_framework}'. Use: pytest, unittest, or nose"

        result = subprocess.run(
            commands[test_framework],
            capture_output=True,
            text=True,
            timeout=60
        )

        output = f"Running tests with {test_framework}:\n"
        output += f"Exit code: {result.returncode}\n\n"
        output += "STDOUT:\n" + result.stdout + "\n"

        if result.stderr:
            output += "STDERR:\n" + result.stderr

        return output

    except subprocess.TimeoutExpired:
        return "Error: Test execution timed out (60s limit)"
    except FileNotFoundError:
        return f"Error: {test_framework} not found. Please install it first."
    except Exception as e:
        return f"Error running tests: {str(e)}"


@mcp.tool()
def format_code(file_path: str, formatter: str = "black", check_only: bool = False) -> str:
    """
    Format code using the specified formatter.

    Args:
        file_path: Path to file or directory to format
        formatter: Code formatter to use - "black", "autopep8", or "isort"
        check_only: If True, only check formatting without modifying files

    Returns:
        Formatting results
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return f"Error: Path '{file_path}' not found"

        commands = {
            "black": ["black", "--check" if check_only else "", file_path],
            "autopep8": ["autopep8", "--diff" if check_only else "--in-place", file_path],
            "isort": ["isort", "--check-only" if check_only else "", file_path]
        }

        if formatter not in commands:
            return f"Error: Unsupported formatter '{formatter}'. Use: black, autopep8, or isort"

        cmd = [arg for arg in commands[formatter] if arg]  # Remove empty strings

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )

        action = "Checking" if check_only else "Formatting"
        output = f"{action} code with {formatter}:\n"
        output += f"Exit code: {result.returncode}\n\n"

        if result.stdout:
            output += "Output:\n" + result.stdout + "\n"

        if result.stderr:
            output += "Errors:\n" + result.stderr + "\n"

        if result.returncode == 0:
            if check_only:
                output += "\nCode formatting is correct!"
            else:
                output += "\nCode formatted successfully!"

        return output

    except subprocess.TimeoutExpired:
        return "Error: Formatting timed out (30s limit)"
    except FileNotFoundError:
        return f"Error: {formatter} not found. Please install it first."
    except Exception as e:
        return f"Error formatting code: {str(e)}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MCP Coding Server")
    parser.add_argument(
        "--transport",
        type=str,
        choices=["stdio", "sse"],
        default="stdio",
        help="Transport mechanism: stdio (default) or sse (HTTP with Server-Sent Events)"
    )
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host to bind to when using SSE transport (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind to when using SSE transport (default: 8000)"
    )

    args = parser.parse_args()

    # Run the FastMCP server with specified transport
    if args.transport == "stdio":
        mcp.run()
    else:  # sse
        print(f"Starting MCP Coding Server on http://{args.host}:{args.port}", file=sys.stderr)
        print(f"Transport: SSE (Server-Sent Events)", file=sys.stderr)
        mcp.run(transport="sse", host=args.host, port=args.port)
