import { McpServer } from "@modelcontextprotocol/server";
import { registerRenderingTools } from "./renderToolRegister.js";
import { performChessAgineHandshake } from "../services/HandshakeEntryPoint.js";

export function registerAgine(server: McpServer, isRemoteEnvEnabled: boolean): void {
    performChessAgineHandshake(server, isRemoteEnvEnabled);
    
    // legacy registering update when v2 of mcp apps sdk comes out
    registerRenderingTools(server);
    
}