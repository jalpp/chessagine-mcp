# ChessAgine MCP

<p align="center">
  <img src="/icon.png" alt="ChessAgine" width="200"/>
</p>

**ChessAgine MCP** is a Model Context Protocol server that gives LLMs deep chess awareness by exposing real-time board state, Stockfish analysis, opening databases, Lichess games, and neural engines including Maia2, Leela, and Elite Leela.

It also renders individual positions and full PGN games for in-depth visual analysis—enabling AI agents to reason about positions, evaluate variations, detect themes, explore game databases, and interact directly with chess engines.

## Preview

<p align="center">
  <img src="/preview.png" alt="ChessAgine Preview" />
</p>

## Installation

ChessAgine MCP is aimed at chess players as much as developers — if you're not sure whether you have Node.js/npm installed, see the [prerequisites note in install.md](install.md#local-build-prerequisite-for-stdio-setups) before picking an option below.

### Option 1: Config File (Recommended, most reliable)

This is currently the most stable way to connect ChessAgine MCP to Claude Desktop.

#### Prerequisites
- Node.js 22+
- npm or yarn package manager
- Anthropic MCP Bundle CLI (npm install -g @anthropic-ai/mcpb)

#### Clone and Setup
```bash
git clone https://github.com/jalpp/chessagine-mcp.git
cd chessagine-mcp
npm install
npm run build
```

#### Configure Claude Desktop

### MacOs
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
### Windows
Run `(Get-AppxPackage *Claude*).PackageFamilyName` to find the virtualized Claude Desktop folder
Add to `%LOCALAPPDATA%\Packages\Claude_virtualized_folder\LocalCache\Roaming\Claude\claude_desktop_config.json`
### Linux 
Add to `~/.config/Claude/claude_desktop_config.json` 

**macOS/Linux:**
```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"],
      "env": {
        "LICHESS_API_TOKEN": "optional-your-lichess-api-token",
        "CHESSBOARD_MAGIC_PAT": "optional-your-chessboardmagic-pat",
        "POSIRA_API_KEY": "optional-your-posira-api-key"
      }
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node", 
      "args": ["C:\\absolute\\path\\to\\chessagine-mcp\\build\\runner\\stdio.js"],
      "env": {
        "LICHESS_API_TOKEN": "optional-your-lichess-api-token",
        "CHESSBOARD_MAGIC_PAT": "optional-your-chessboardmagic-pat",
        "POSIRA_API_KEY": "optional-your-posira-api-key"
      }
    }
  }
}
```

### Option 2: Using MCPB File (experimental — currently less stable)

> [!WARNING]  
> The `.mcpb` install path has known rough edges in some Claude Desktop versions. If it fails to load, use **Option 1** above instead. Its one advantage: Claude Desktop runs it with its own bundled Node runtime, so you don't need Node.js/npm installed yourself for this option.

Download the `chessagine-mcp.mcpb` file and install it directly in Claude Desktop:

1. Download the latest release from [GitHub releases](https://github.com/jalpp/chessagine-mcp/releases)
2. Open Claude Desktop
3. Go to Settings → Extensions → Install from file
4. Select the `chessagine-mcp.mcpb` file
5. Restart Claude Desktop

> [!NOTE]  
> To make sure its working correctly ask it to render the chessboard or a specific chess query

### Option 3: Connect to the Hosted Remote Server (No Install)

Skip the build entirely and point any MCP-compatible client at the hosted deployment:

```
https://chessagine-mcp.vercel.app/mcp
```

This is a Streamable HTTP endpoint — no API key or local setup required. Exact steps differ by client (config file vs. UI), so see **[install.md](install.md)** for copy-pasteable setup steps covering Claude Desktop, Claude Code, LibreChat, Open WebUI, AnythingLLM, Jan, Goose, Cursor, Windsurf, Cline, VS Code, Continue.dev, Zed, and other MCP-compatible GUIs — both open source and proprietary — for both the remote URL and the local stdio server.

### Usage:

- show me my last Lichess game I played, I'm insert_your_username there, also analyze the game using Stockfish
- given fen compare and constrast what stockfish thinks vs Leela and Maia
- analyze my opening rep from Chessboard magic.

### ChessAgine.Skill

to properly use ChessAgine MCP, give LLM access to how to properly use the it via .skill file in ./chessagine-skill/ folder

### Deploy your own instance

You can deploy your own copy to Vercel in a few clicks:

1. Fork this repo
2. Go to [vercel.com/new](https://vercel.com/new) and import your fork
3. No environment variables needed — just deploy
4. Your server will be at `https://your-project.vercel.app/mcp`

### Dev commands

```bash
npm run build:mcp  # Builds the mcp server layer which generates mcpb file
npm run build:ui   # Builds the ChessAgine MCP UI html files
npm run build      # Builds entire project, use for local development
npm run start      # starts the MCP server
npm run debug      # opens MCP inspector to inspect new changes made
```

## License

This project is licensed under the MIT License, the /themes and /protocol are under GPL. See the [LICENSE](LICENSE) file for details.

## Authors
@jalpp
