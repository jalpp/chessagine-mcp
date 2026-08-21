import { McpServer } from "@modelcontextprotocol/server";
import { registerRenderingTools } from "./renderToolRegister.js";
import { performChessAgineHandshake } from "../services/HandshakeEntryPoint.js";
import { registerDojoToolsRemote } from "./remote/registerDojoContract.remote.js";
import { registerCBMToolsRemote } from "./remote/registerCbmContract.remote.js";
import { registerLichessToolsRemote } from "./remote/registerLichessContract.remote.js";
import { registerPosiraToolsRemote } from "./remote/registerPosiraContract.remote.js";

export function registerAgineRemote(server: McpServer): void {
    // non remote contracts taken care by handshake imp
    performChessAgineHandshake(server);
        
    // remote ones we manually register to have difference remote/stdio functions more code but more reliable also
    registerDojoToolsRemote(server);
    registerCBMToolsRemote(server);
    registerLichessToolsRemote(server);
    registerPosiraToolsRemote(server);
    
    // legacy registering update when v2 of mcp apps sdk comes out
    registerRenderingTools(server);
    
}