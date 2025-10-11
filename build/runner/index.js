import z from "zod";
import { registerAgine } from "../mcp/registerAgine.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
export const configSchema = z.object({
    debug: z.boolean().default(false).describe("Enable debug logging"),
});
export default function createServer({ config, }) {
    const Mcpserver = new McpServer({
        name: "chessagine-mcp",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });
    console.warn(config);
    registerAgine(Mcpserver);
    return Mcpserver.server;
}
