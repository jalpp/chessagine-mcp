import { McpServer } from "@modelcontextprotocol/server";
import { getToolAdapter, postToolAdapter } from "@jalpp/mcp-adapter";
import { LichessContracts } from "./schema/lichess.js";


const POST_CONTRACTS = new Set<string>(["fetch-chess-puzzle"]);

export function registerLichessTools(server: McpServer): void {
  for (const contract of LichessContracts) {
    if (POST_CONTRACTS.has(contract.name)) {
      postToolAdapter(server, contract);
    } else {
      getToolAdapter(server, contract);
    }
  }
}
