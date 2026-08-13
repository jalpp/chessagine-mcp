import { McpServer } from "@modelcontextprotocol/server";
import { registerRenderingTools } from "../renderToolRegister.js";
import { registerUtilsTools } from "../utilToolRegister.js";
import { registerStockfishTools } from "../stockfishToolRegister.js";
import { registerChessDBTools } from "../chessDbToolRegister.js";
import { registerNeuralNetTools } from "../neuralNetToolRegister.js";
import { registerThemeAnalysisTools } from "../themesToolRegister.js";
import { registerBoardStateTools } from "../boardToolRegister.js";
import { registerLichessToolsRemote } from "./lichessToolRegister.remote.js";
import { registerCBMToolsRemote } from "./cbmToolRegister.remote.js";
import { registerPosiraToolsRemote } from "./posiraToolRegister.remote.js";
import { registerDojoToolsRemote } from "./dojoToolRegister.remote.js";

export function registerAgineRemote(server: McpServer): void {
    registerLichessToolsRemote(server);
    registerRenderingTools(server);
    registerCBMToolsRemote(server);
    registerStockfishTools(server);
    registerUtilsTools(server);
    registerThemeAnalysisTools(server);
    registerBoardStateTools(server);
    registerChessDBTools(server);
    registerNeuralNetTools(server);
    registerPosiraToolsRemote(server);
    registerDojoToolsRemote(server);
}
