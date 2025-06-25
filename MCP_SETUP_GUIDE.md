# MCP (Model Context Protocol) Setup Guide

## What is MCP?

MCP allows Claude to interact with external tools and services through standardized interfaces, greatly expanding capabilities beyond the default tools.

## Quick Setup

### 1. Edit Configuration File

The configuration file is located at:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. Add MCP Servers

Here's a minimal configuration to get started:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/your-username/projects"
      ]
    }
  }
}
```

### 3. Restart Claude Desktop

After editing the configuration, you must restart Claude Desktop for changes to take effect.

## Recommended MCP Servers

### 1. Filesystem Server
Provides file system access capabilities.

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/path/to/allowed/directory"
  ]
}
```

### 2. GitHub Server
Interact with GitHub repositories, issues, and PRs.

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
  }
}
```

To get a GitHub token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `read:user`

### 3. PostgreSQL Server (Already configured)
You already have this for your Supabase database.

### 4. Puppeteer Server
Web browsing and scraping capabilities.

```json
"puppeteer": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}
```

### 5. Memory Server
Persistent memory across conversations.

```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

## Your Current Configuration

You currently have:
1. **property-mx**: PostgreSQL connection to your Supabase database
2. **context7**: Context management server

## How to Add New Servers

1. Open the configuration file:
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Add new servers inside the `mcpServers` object

3. Save the file

4. Restart Claude Desktop

## Troubleshooting

### Server Not Working?
1. Check the Claude Desktop logs
2. Ensure you have Node.js installed
3. Try running the npx command manually to see errors

### Permission Issues?
- For filesystem server, ensure the path exists and is accessible
- For API-based servers, verify your API keys are correct

## Security Considerations

1. **Filesystem Access**: Only grant access to directories you trust Claude to read/write
2. **API Keys**: Store sensitive keys in environment variables when possible
3. **Database Access**: Your current PostgreSQL MCP already uses read-only access - good practice!

## Next Steps

1. Add the filesystem server for better file handling
2. Consider adding GitHub integration for version control operations
3. Add web browsing capabilities with Puppeteer for research

Would you like me to help you add any specific MCP servers to your configuration?