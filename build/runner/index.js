import z from "zod";
import { server } from "./server.js";
import { registerAgine } from "../mcp/registerAgine.js";
export const configSchema = z.object({
    debug: z.boolean().default(false).describe("Enable debug logging"),
});
export default function createServer({ config, }) {
    console.log("using config ", config);
    registerAgine(server);
    return server.server;
}
