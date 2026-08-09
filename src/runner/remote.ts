#!/usr/bin/env node

import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import type { McpServer, AuthInfo } from "@modelcontextprotocol/server";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import cors from "cors";
import type { Request, Response } from "express";
import { server } from "./server.js";
import { registerAgineRemote } from "../mcp/remote/registerAgineRemote.js";
import { extractRemoteCredentials } from "../mcp/remote/remoteAuth.js";

/**
 * Factory function to create a new MCP server instance
 */
function createChessAgineServer(): McpServer {
  // Create a new server instance for each request
  const serverInstance = Object.create(server);
  registerAgineRemote(serverInstance);
  return serverInstance;
}

/**
 * Starts the ChessAgine MCP server with Streamable HTTP transport
 */
async function startStreamableHTTPServer(): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);
  const app = createMcpExpressApp({ host: "0.0.0.0" });
  
  app.use(cors());

  app.all("/mcp", async (req: Request, res: Response) => {
    const serverInstance = createChessAgineServer();
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      serverInstance.close().catch(() => {});
    });

    try {
      // Resolve X-Lichess-Token / X-Chessboardmagic-Token / X-Posira-Token
      // headers (see src/mcp/remote/remoteAuth.ts) into an AuthInfo the SDK
      // threads through to every tool call as `extra.authInfo`. Same
      // no-env-var, header-then-tool-argument precedence as api/mcp.ts.
      const authInfo: AuthInfo = {
        token: "chessagine-remote-passthrough",
        clientId: "chessagine-remote",
        scopes: [],
        extra: extractRemoteCredentials(req.headers) as Record<string, unknown>,
      };
      (req as typeof req & { auth?: AuthInfo }).auth = authInfo;

      await serverInstance.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("ChessAgine MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, () => {
    console.log(`ChessAgine MCP server listening on http://localhost:${port}/mcp`);
  });

  const shutdown = () => {
    console.log("\nShutting down ChessAgine MCP server...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main() {
  try {
    await startStreamableHTTPServer();
  } catch (error) {
    console.error("Failed to start ChessAgine MCP server:", error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
