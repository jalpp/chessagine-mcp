#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { server } from "./server.js";
import { registerAgine } from "../mcp/registerAgine.js";


 async function main() {
  try {
   
    const transport = new StdioServerTransport();
    registerAgine(server);
    await server.connect(transport);
    console.error("ChessAgine MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

main().catch(async (error) => {
  console.error("Fatal error in main():", error);

  process.exit(1);
});