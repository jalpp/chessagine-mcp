#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";
import { registerAgine } from "../mcp/registerAgine.js";
// Main function to run the server
async function main() {
    const transport = new StdioServerTransport();
    registerAgine(server);
    await server.connect(transport);
    console.error("ChessAgine MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
