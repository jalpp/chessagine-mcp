import { McpServer } from "@modelcontextprotocol/server";
import { getToolAdapter } from "@jalpp/mcp-adapter";
import { CBMContracts } from "./schema/cbm.js";

export function registerCBMTools(mcpserver: McpServer) {
  for (let i = 0; i < CBMContracts.length; i++) {
    getToolAdapter(mcpserver, CBMContracts[i]);
  }
}
