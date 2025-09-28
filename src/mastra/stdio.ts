#!/usr/bin/env node
import { MCPServer } from "@mastra/mcp";
import { AgineTools } from "./tools";

// Add debug logging
console.error("Starting chessagine-mcp server...");

export const server = new MCPServer({
  name: "chessagine-mcp",
  version: "1.0.0",
  tools: AgineTools
});

// server.startStdio().catch((error) => {
//   console.error("Error running MCP server:", error);
//   process.exit(1);
// });


