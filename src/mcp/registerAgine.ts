import { McpServer } from "@modelcontextprotocol/server";
import { registerRenderingTools } from "./renderToolRegister.js";
import { performChessAgineHandshake } from "../services/HandshakeEntryPoint.js";
import { registerDojoTools } from "./registerDojoContract.js";
import { registerCBMTools } from "./registerCbmContract.js";
import { registerLichessTools } from "./registerLichessContract.js";
import { registerPosiraTools } from "./registerPosiraContract.js";

export function registerAgine(server: McpServer): void {
    // non remote contracts taken care by handshake imp
    performChessAgineHandshake(server);

    // remote ones we manually register to have difference remote/stdio functions more code but more reliable also
    registerDojoTools(server);
    registerCBMTools(server);
    registerLichessTools(server);
    registerPosiraTools(server);

    // rendering we keep as if its a remote server due to its rendering functions 
    registerRenderingTools(server);
    
}