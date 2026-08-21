#!/usr/bin/env node

import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer } from "@modelcontextprotocol/server";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import cors from "cors";
import type { Request, Response } from "express";
import { registerAgineRemote } from "../mcp/registerAgineRemote.js";
import { extractRemoteCredentials } from "../mcp/remote/remoteAuth.js";


function createChessAgineServer(): McpServer {
  const serverInstance = new McpServer({
    name: "chessagine-mcp",
    websiteUrl: "https://www.chessagine.com/",
    version: "0.8.0",
  });
  registerAgineRemote(serverInstance);
  return serverInstance;
}


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
