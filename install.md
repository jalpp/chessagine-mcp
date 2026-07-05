# ChessAgine MCP — Client Setup Instructions

This guide covers connecting **ChessAgine MCP** to every popular MCP-compatible client — Claude Desktop, several open-source chat/agent GUIs (LibreChat, Open WebUI, AnythingLLM, Jan, Goose), and popular MCP-enabled IDEs — using either:

- **Remote (hosted, no install)** — connect straight to `https://chessagine-mcp.vercel.app/mcp`. This is the public Streamable HTTP endpoint for this repo's Vercel deployment. No API key, no build step, no local Node install required. (Legacy `/sse` and `/message` routes are also proxied to the same handler for older clients.)
- **Local (stdio)** — clone this repo, build it, and point your client at `build/runner/stdio.js` on your machine. Use this if you want to run your own copy, modify the server, or work offline.

**A note for non-developers:** ChessAgine MCP is aimed at chess players, not just engineers, so several sections below call out exactly what software (Node.js, npm) you need installed before a step will work — don't assume it's already on your machine.

Pick whichever mode fits the client instructions below. Most clients support both; a few simple GUIs only speak stdio, in which case use the `mcp-remote` bridge trick described in [Clients that only support stdio](#clients-that-only-support-stdio-5ire-and-others).

> [!NOTE]
> After connecting in any client, ask it to render a chessboard or look up a FEN to confirm the tools are loaded correctly.

## Contents

- [Local build (prerequisite for stdio setups)](#local-build-prerequisite-for-stdio-setups)
- [API keys / optional credentials](#api-keys--optional-credentials)
- [Claude Desktop](#claude-desktop)
- [Claude Code (CLI)](#claude-code-cli)
- [LibreChat (open source)](#librechat-open-source)
- [Open WebUI (open source)](#open-webui-open-source)
- [AnythingLLM (open source)](#anythingllm-open-source)
- [Jan (open source)](#jan-open-source)
- [Goose (open source)](#goose-open-source)
- [Cursor](#cursor)
- [Windsurf](#windsurf)
- [Cline (VS Code extension, open source)](#cline-vs-code-extension-open-source)
- [VS Code (native GitHub Copilot MCP support)](#vs-code-native-github-copilot-mcp-support)
- [Continue.dev (open source)](#continuedev-open-source)
- [Zed (open source)](#zed-open-source)
- [Clients that only support stdio (5ire and others)](#clients-that-only-support-stdio-5ire-and-others)
- [Troubleshooting](#troubleshooting)

---

## Local build (prerequisite for stdio setups)

Skip this if you're only using the remote URL.

**Prerequisites — install these first if you don't already have them:**

- **Node.js 22+** — download from [nodejs.org](https://nodejs.org) (installing Node also installs npm). Verify with:
  ```bash
  node -v
  npm -v
  ```
  If either command says "command not found," install Node.js before continuing — this applies to every "local (stdio)" option in this guide, not just Claude Desktop.
- **git** (to clone the repo) — most Macs/Linux machines have it; on Windows, install [Git for Windows](https://git-scm.com/download/win).

**Build steps:**

```bash
git clone https://github.com/jalpp/chessagine-mcp.git
cd chessagine-mcp
npm install
npm run build
```

This produces `build/runner/stdio.js`. Every "local" config below points at the absolute path to that file, e.g.:

- macOS/Linux: `/absolute/path/to/chessagine-mcp/build/runner/stdio.js`
- Windows: `C:\absolute\path\to\chessagine-mcp\build\runner\stdio.js`

---

## API keys / optional credentials

ChessAgine MCP works with zero configuration, but a few tools support (or require) personal API keys for services beyond Stockfish/ChessDB, which are all key-free:

| Env var | Used by | Required? |
|---|---|---|
| `LICHESS_API_TOKEN` | Lichess explorer/games/studies tools (`get-lichess-master-games`, `get-lichess-games`, `fetch-lichess-games`, `fetch-lichess-studies`, `fetch-lichess-study-pgn`) | Optional server-side default, used only if it's set. Every one of these tools also accepts an optional `token` argument per call, which takes priority over the env var — pass your own PAT in conversation if you want to use a different token than the server default (e.g. to read private studies). |
| `CHESSBOARD_MAGIC_PAT` | ChessBoard Magic tools (repertoires, games, TCEC stats, etc.) | Optional server-side default. Every ChessBoard Magic tool also accepts an optional `token` argument per call — if you pass your own PAT in the conversation/tool call, it's used instead of the env var. |
| `POSIRA_API_KEY` | `get-posira-explorer`, `get-posira-health` | Currently **env-only** — these two tools have no per-call token argument yet, so a personal key can only be supplied via this env var today (see the note in [Troubleshooting](#troubleshooting)). |

Lichess *usernames* (as opposed to tokens) are always passed as a normal tool argument (e.g. `fetch-lichess-games`, `fetch-lichess-studies` both take `username` directly) — just tell the agent your Lichess username in conversation. There is no `LICHESS_USERNAME` env var; an older `get-lichess-username` tool that read one has been removed, since it only ever returned a single hardcoded server-side value with no way to personalize it, and every other Lichess tool that needs a username already takes it as an argument.

### Setting env vars for a local (stdio) server

Add an `"env"` object next to `"command"`/`"args"` in any client's local config from this guide. For example, in Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"],
      "env": {
        "LICHESS_API_TOKEN": "your-lichess-api-token",
        "CHESSBOARD_MAGIC_PAT": "your-chessboardmagic-pat",
        "POSIRA_API_KEY": "your-posira-api-key"
      }
    }
  }
}
```

The same `"env"` key works in Cursor, Windsurf, Cline, VS Code, Zed, and AnythingLLM's JSON configs — just add it alongside `command`/`args` in your entry. For LibreChat/Continue.dev/Goose's YAML configs, add an `env:` mapping under the server entry instead, e.g.:

```yaml
mcpServers:
  chessagine-mcp:
    type: stdio
    command: node
    args:
      - /absolute/path/to/chessagine-mcp/build/runner/stdio.js
    env:
      LICHESS_API_TOKEN: your-lichess-api-token
      CHESSBOARD_MAGIC_PAT: your-chessboardmagic-pat
      POSIRA_API_KEY: your-posira-api-key
```

Restart the client after adding env vars, same as any other config change.

### Env vars and the hosted remote server

The hosted server at `https://chessagine-mcp.vercel.app/mcp` is a single shared deployment — any env vars set there apply globally to every user connecting to it, not per-user. In practice:

- For `LICHESS_API_TOKEN`- and `CHESSBOARD_MAGIC_PAT`-backed tools, pass your own token/PAT as the `token` tool argument in conversation instead of relying on the shared server's env var.
- For `POSIRA_API_KEY`-backed tools, there is currently no per-call override — see [Troubleshooting](#troubleshooting).
- If you deploy your own fork to Vercel (see the main README's "Deploy your own instance" section), you can set your own env vars under your Vercel project's **Settings → Environment Variables**, which then apply to everyone using *your* deployment.

## Claude Desktop

### Option 1: Config file (recommended, most reliable)

This is the most stable way to connect ChessAgine MCP to Claude Desktop. It requires Node.js and npm to be installed on your machine (see [prerequisites](#local-build-prerequisite-for-stdio-setups) above) if you're running the server locally.

#### 1a. Local (stdio) — run the server on your own machine

Build the project first (see [Local build](#local-build-prerequisite-for-stdio-setups)), then edit your config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**macOS/Linux:**
```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
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
      "args": ["C:\\absolute\\path\\to\\chessagine-mcp\\build\\runner\\stdio.js"]
    }
  }
}
```

#### 1b. Remote (hosted) — no build, no Node required for this option

Claude Desktop's `claude_desktop_config.json` only validates **stdio** servers — adding a raw `url`/`type: "http"` entry there is not supported and can be rejected or ignored on startup. There are two ways around this for the hosted server:

**Via Custom Connectors UI (no npm/Node needed at all):**

1. Open Claude Desktop → **Settings → Connectors**.
2. Click **Add custom connector**.
3. Set the URL to `https://chessagine-mcp.vercel.app/mcp`.
4. Save, then enable the connector for your conversation.

Custom Connectors are available on Pro, Max, Team, and Enterprise plans.

**Or via config file, using the `mcp-remote` bridge (requires Node/npm/npx installed):**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://chessagine-mcp.vercel.app/mcp"]
    }
  }
}
```

Restart Claude Desktop after any config change.

### Option 2: MCPB file (experimental — currently less stable than the config file)

> [!WARNING]
> The `.mcpb` bundle install path is newer and has known rough edges in some Claude Desktop versions. If it fails to load or behaves oddly, fall back to **Option 1** above, which is the more reliable path today.

Claude Desktop's own bundled Node runtime runs `.mcpb` extensions, so this route does **not** require you to install Node.js or npm yourself — that's the main advantage over Option 1 if it works on your setup.

1. Download the latest `chessagine-mcp.mcpb` file from [GitHub releases](https://github.com/jalpp/chessagine-mcp/releases).
2. Open Claude Desktop.
3. Go to **Settings → Extensions → Install from file**.
4. Select the `chessagine-mcp.mcpb` file.
5. Optionally fill in the Lichess/ChessBoard Magic/Posira API keys in the extension's config panel (all optional).
6. Restart Claude Desktop.

> [!NOTE]
> After either option, ask Claude to render a chessboard or answer a specific chess query to confirm it's working.

---

## Claude Code (CLI)

```bash
# Remote (recommended)
claude mcp add --transport http chessagine-mcp https://chessagine-mcp.vercel.app/mcp

# Local (requires Node.js — see prerequisites above)
claude mcp add chessagine-mcp -- node /absolute/path/to/chessagine-mcp/build/runner/stdio.js
```

Run `claude mcp list` to confirm it's registered, then `/mcp` inside a session to check connection status.

---

## LibreChat (open source)

Add an entry under `mcpServers` in your `librechat.yaml`.

**Remote:**

```yaml
mcpServers:
  chessagine-mcp:
    type: streamable-http
    url: https://chessagine-mcp.vercel.app/mcp
```

**Local (stdio, requires Node.js on the machine running LibreChat's API service):**

```yaml
mcpServers:
  chessagine-mcp:
    type: stdio
    command: node
    args:
      - /absolute/path/to/chessagine-mcp/build/runner/stdio.js
```

Restart your LibreChat instance (or the API container) after editing `librechat.yaml`. For production/multi-user deployments, prefer the `streamable-http` remote entry — it's stateless and scales better than stdio or SSE.

---

## Open WebUI (open source)

Open WebUI (v0.6.31+) connects directly to Streamable HTTP MCP servers — no bridge needed, and no Node install required for the remote option.

1. Go to **Admin Settings → External Tools**.
2. Click **+ (Add Server)**.
3. Set **Type** to `MCP (Streamable HTTP)`.
4. Set **Server URL** to `https://chessagine-mcp.vercel.app/mcp`.
5. Leave auth blank (this server requires none), save, and restart the container if prompted.

Only admins can add MCP servers in Open WebUI. If you'd rather run your own local copy of the server and expose it over HTTP, front the stdio build with the `mcpo` proxy first — Open WebUI's native MCP support is HTTP-only.

---

## AnythingLLM (open source)

AnythingLLM (desktop or Docker) reads MCP servers from an `anythingllm_mcp_servers.json` file:

- macOS: `~/Library/Application Support/anythingllm-desktop/storage/plugins/anythingllm_mcp_servers.json`
- Windows: `%APPDATA%\anythingllm-desktop\storage\plugins\anythingllm_mcp_servers.json`
- Docker: `${STORAGE_LOCATION}/plugins/anythingllm_mcp_servers.json`

If the file doesn't exist yet, open the **Agent Skills** page in the AnythingLLM UI once and it will be created automatically.

**Remote:**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "type": "streamable",
      "url": "https://chessagine-mcp.vercel.app/mcp"
    }
  }
}
```

**Local (stdio, requires Node.js):**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
    }
  }
}
```

AnythingLLM auto-detects the file and boots the server; you can also manage servers from the UI directly.

---

## Jan (open source)

Jan is a fully open-source (AGPLv3), offline-first desktop assistant with built-in MCP support.

1. Open Jan → **Settings → MCP Servers**.
2. Click **+ Add MCP Server**.
3. For the hosted server, paste the endpoint URL: `https://chessagine-mcp.vercel.app/mcp`.
4. For a local build (requires Node.js), instead provide the command form, equivalent to:
   ```json
   {
     "mcpServers": {
       "chessagine-mcp": {
         "command": "node",
         "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
       }
     }
   }
   ```
5. Jan asks you to approve each tool call individually the first time it's used — approve the ChessAgine tools you want to allow.

---

## Goose (open source)

[Goose](https://github.com/block/goose) is Block's open-source AI agent, available as a desktop app and CLI.

**Desktop / interactive `goose configure`:**

1. Run `goose configure` (CLI) or open the Goose desktop app's extensions panel.
2. Choose **Remote Extension (Streamable HTTP)**.
3. Enter the endpoint: `https://chessagine-mcp.vercel.app/mcp`.
4. Leave headers blank (no auth required).

**Or edit `~/.config/goose/config.yaml` directly:**

```yaml
extensions:
  chessagine-mcp:
    enabled: true
    type: streamable_http
    name: ChessAgine
    uri: https://chessagine-mcp.vercel.app/mcp
    timeout: 300
```

**Local (stdio, requires Node.js):**

```yaml
extensions:
  chessagine-mcp:
    enabled: true
    type: stdio
    name: ChessAgine
    cmd: node
    args:
      - /absolute/path/to/chessagine-mcp/build/runner/stdio.js
```

Verify with `goose info -v`.

---

## Cursor

Create/edit `.cursor/mcp.json` (project-scoped) or `~/.cursor/mcp.json` (global).

**Remote:**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "url": "https://chessagine-mcp.vercel.app/mcp"
    }
  }
}
```

**Local (stdio, requires Node.js):**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
    }
  }
}
```

Open **Settings → MCP** in Cursor to confirm the server shows a green/active status.

---

## Windsurf

Edit `~/.codeium/windsurf/mcp_config.json` (macOS/Linux) or `%USERPROFILE%\.codeium\windsurf\mcp_config.json` (Windows).

**Remote:**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "serverUrl": "https://chessagine-mcp.vercel.app/mcp"
    }
  }
}
```

**Local (stdio, requires Node.js):**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
    }
  }
}
```

Restart Windsurf after editing the file for the server to load.

---

## Cline (VS Code extension, open source)

**Easiest path — Remote Servers tab:** open Cline's MCP panel → **Remote Servers** tab → enter a name and the URL `https://chessagine-mcp.vercel.app/mcp` → **Add Server**.

**Or edit `cline_mcp_settings.json` directly:**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "type": "streamableHttp",
      "url": "https://chessagine-mcp.vercel.app/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**Local (stdio, requires Node.js):**

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Note: omitting `"type"` defaults to the legacy `sse` transport, so set `streamableHttp` explicitly.

---

## VS Code (native GitHub Copilot MCP support)

Create `.vscode/mcp.json` in your workspace (or add to your user profile settings). Note the root key is `servers`, not `mcpServers`.

**Remote:**

```json
{
  "servers": {
    "chessagine-mcp": {
      "type": "http",
      "url": "https://chessagine-mcp.vercel.app/mcp"
    }
  }
}
```

**Local (stdio, requires Node.js):**

```json
{
  "servers": {
    "chessagine-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
    }
  }
}
```

Run **MCP: List Servers** from the Command Palette to verify it started.

---

## Continue.dev (open source)

Add to your `config.yaml`:

**Remote:**

```yaml
mcpServers:
  - name: ChessAgine
    type: streamable-http
    url: https://chessagine-mcp.vercel.app/mcp
```

**Local (stdio, requires Node.js):**

```yaml
mcpServers:
  - name: ChessAgine
    type: stdio
    command: node
    args:
      - /absolute/path/to/chessagine-mcp/build/runner/stdio.js
```

---

## Zed (open source)

Zed keys MCP servers under `context_servers` (not `mcpServers`) in `settings.json`, and — like most stdio-first clients — needs the `mcp-remote` bridge to reach an HTTP server.

**Remote (via mcp-remote bridge, requires Node.js/npx):**

```json
{
  "context_servers": {
    "chessagine-mcp": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://chessagine-mcp.vercel.app/mcp"]
    }
  }
}
```

**Local (stdio, requires Node.js):**

```json
{
  "context_servers": {
    "chessagine-mcp": {
      "source": "custom",
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/runner/stdio.js"]
    }
  }
}
```

Zed restarts the context server automatically after you save `settings.json` — no editor restart needed.

---

## Clients that only support stdio (5ire and others)

Some lightweight desktop MCP clients (e.g. **5ire**, open source) only know how to spawn a local command — they don't have a native "remote URL" field. For these, use `mcp-remote` as a stdio-to-HTTP bridge so the client thinks it's running a local server, while it actually proxies to the hosted ChessAgine endpoint. This requires Node.js/npm to be installed (for `npx`), even though you're connecting to the remote server:

```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://chessagine-mcp.vercel.app/mcp"]
    }
  }
}
```

Consult your specific client's docs for where this JSON snippet (or equivalent "add server" form) goes — the `command`/`args` shape above is the pattern accepted by nearly every stdio-based MCP client. If the client instead just wants a plain local command to run, use the local build path (`node /absolute/path/to/chessagine-mcp/build/runner/stdio.js`) directly.

---

## Troubleshooting


- **"node: command not found" / "npm: command not found"** — Node.js isn't installed. Install it from [nodejs.org](https://nodejs.org) (this installs npm too), then re-open a fresh terminal and re-check with `node -v`.
- **Node version errors on local stdio** — this project requires Node.js 22+. Check with `node -v`.
- **Client shows "server disconnected" for the remote URL** — confirm you used `/mcp` (not just the bare domain) and that your network allows outbound HTTPS to `vercel.app`.
- **Config file "silently" stops working (Claude Desktop)** — this usually means a `url`/`type: http` field was added directly to `claude_desktop_config.json`, which Claude Desktop doesn't support for stdio-only config. Use the Custom Connectors UI or the `mcp-remote` bridge instead (see [Claude Desktop](#claude-desktop) above).
- **MCPB extension won't install or crashes on load** — this install path is currently less stable than the config-file method; use [Option 1](#option-1-config-file-recommended-most-reliable) instead.
- **CORS / browser-based client errors** — the deployed server already sends permissive CORS headers (`Access-Control-Allow-Origin: *`) and allows `Mcp-Session-Id`, `Authorization`, and `Content-Type` headers, so this shouldn't be the cause; double-check the exact URL first.
- **No tools show up after connecting** — ask the assistant to "list available tools" or render a chessboard; some clients lazily fetch the tool list on first use.
- **Self-hosting your own copy** — fork this repo, import it at [vercel.com/new](https://vercel.com/new), deploy with no environment variables, and use `https://your-project.vercel.app/mcp` in place of the URL throughout this doc.
