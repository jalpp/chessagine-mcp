import { McpServer } from "@modelcontextprotocol/server";
import { getToolAdapter, postToolAdapter } from "@jalpp/mcp-adapter";
import { LichessContracts } from "./schema/lichess.js";

export function registerLichessTools(server: McpServer): void {
  for (let i = 0; i < LichessContracts.length; i++) {
    if (LichessContracts[i].name.includes("get")) {
      getToolAdapter(server, LichessContracts[i]);
    } else {
      postToolAdapter(server, LichessContracts[i]);
    }
  }
}
