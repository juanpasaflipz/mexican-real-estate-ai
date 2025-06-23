#!/bin/bash

# PostgreSQL MCP Server Installation Script for macOS/Linux
# This script installs and configures the PostgreSQL MCP server for Claude Desktop

set -e

echo "================================================"
echo "PostgreSQL MCP Server Installation for Claude"
echo "================================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo "   Node version: $(node --version)"
echo "   npm version: $(npm --version)"
echo

# Install the PostgreSQL MCP server globally
echo "📦 Installing @modelcontextprotocol/server-postgres..."
npm install -g @modelcontextprotocol/server-postgres

echo
echo "✅ PostgreSQL MCP server installed successfully!"
echo

# Create Claude Desktop config directory if it doesn't exist
CONFIG_DIR="$HOME/Library/Application Support/Claude"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CONFIG_DIR="$HOME/.config/Claude"
fi

mkdir -p "$CONFIG_DIR"

# Check if claude_desktop_config.json exists
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Claude Desktop config file already exists at:"
    echo "   $CONFIG_FILE"
    echo
    echo "Please manually add the PostgreSQL server configuration to your existing file."
    echo "See claude_desktop_config.json in this directory for the configuration to add."
else
    echo "📝 Creating Claude Desktop configuration..."
    cp claude_desktop_config.json "$CONFIG_FILE"
    echo "✅ Configuration file created at:"
    echo "   $CONFIG_FILE"
fi

echo
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo
echo "Next steps:"
echo "1. If needed, edit the configuration file to update the database connection string"
echo "2. Restart Claude Desktop application"
echo "3. The PostgreSQL server should now be available in Claude"
echo
echo "To test the connection, ask Claude:"
echo "  'Can you connect to my PostgreSQL database and show me the tables?'"
echo
echo "For more information, see README.md"