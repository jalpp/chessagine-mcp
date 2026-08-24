import { McpServer } from "@modelcontextprotocol/server";
import { BoardStateEngineContract } from "./BoardStateEngineContract.js";
import { ChessDbApiContract } from "./ChessDBContract.js";
import { NNEDBApiContract } from "./NNEDBContract.js";
import { StockfishApiContract } from "./StockfishEngineContract.js";
import { ThemeApiContract } from "./ThemeEngineContract.js";
import { UtilEngineContract } from "./UtilEngineContract.js";
import { MCPContractHandshakeStrategy } from "./MCPContractHandshake.js";

export function performChessAgineHandshake(
  mcpServer: McpServer,
) {
  const boardStateContract = new BoardStateEngineContract();

  const chessDbContract = new ChessDbApiContract();

  const netsContract = new NNEDBApiContract();

  const sfContract = new StockfishApiContract();

  const themeContract = new ThemeApiContract();

  const utilContract = new UtilEngineContract();

  const handshakePerformer = new MCPContractHandshakeStrategy(
    mcpServer,
    [
      boardStateContract,
      chessDbContract,
      netsContract,
      sfContract,
      themeContract,
      utilContract,
    ],
  );

  handshakePerformer.performApiContractsHandshakes();
}
