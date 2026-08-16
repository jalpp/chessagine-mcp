import { McpServer } from "@modelcontextprotocol/server";
import { registerRenderingTools } from "./renderToolRegister.js";
import { performChessAgineHandshake } from "../services/HandshakeEntryPoint.js";

export function registerAgine(server: McpServer): void {
    performChessAgineHandshake(server);
    
    // legacy registering update when v2 of mcp apps sdk comes out
    registerRenderingTools(server);
    
}