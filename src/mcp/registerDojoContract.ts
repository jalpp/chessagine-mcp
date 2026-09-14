import { McpServer } from "@modelcontextprotocol/server";
import { getToolAdapter, postToolAdapter } from "@jalpp/mcp-adapter";
import { DojoContracts } from "./schema/dojo.js";

export function registerDojoTools(server: McpServer): void {
  for (let i = 0; i < DojoContracts.length; i++) {
    if (DojoContracts[i].name.includes("get")) {
      getToolAdapter(server, DojoContracts[i]);
    } else {
      postToolAdapter(server, DojoContracts[i]);
    }
  }
}
