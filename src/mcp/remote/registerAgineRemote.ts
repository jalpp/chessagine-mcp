import { McpServer } from "@modelcontextprotocol/server";
import { registerAgine } from "../registerAgine.js";

export function registerAgineRemote(server: McpServer): void {
  registerAgine(server, true);
}
