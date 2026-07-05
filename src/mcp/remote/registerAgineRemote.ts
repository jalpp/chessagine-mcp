/**
 * @file Remote-only tool registration entry point.
 *
 * Used exclusively by api/mcp.ts (Vercel) and src/runner/remote.ts (self-hosted
 * Streamable HTTP). The local stdio server keeps using ../registerAgine.ts
 * unchanged, so nothing here affects `npm run start` / the MCPB bundle.
 *
 * The only difference from registerAgine(): Lichess, ChessBoard Magic, and
 * Posira tools are registered via their *Remote variants, which resolve
 * credentials from per-request headers or a tool-call argument -- never
 * from process.env. Every other tool (rendering, Stockfish, board state,
 * ChessDB, neural nets, themes, utils) is identical to the stdio server and
 * is reused as-is, since none of them read credentials at all.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
}
