import { McpServer } from "@modelcontextprotocol/server";
import { BoardStateEngineContract } from "./BoardStateEngineContract.js";
import { ChessBoardMagicApiContract } from "./CBMContract.js";
import { ChessDbApiContract } from "./ChessDBContract.js";
import { ChessDojoApiContract } from "./DojoContract.js";
import { LichessContract } from "./LichessContract.js";
import { NNEDBApiContract } from "./NNEDBContract.js";
import { PosiraApiContract } from "./PosiraContract.js";
import { StockfishApiContract } from "./StockfishEngineContract.js";
import { ThemeApiContract } from "./ThemeEngineContract.js";
import { UtilEngineContract } from "./UtilEngineContract.js";
import { MCPContractHandshakeStrategy } from "./MCPContractHandshake.js";

export function performChessAgineHandshake(
  mcpServer: McpServer,
  isRemoteEnvEnabled: boolean,
) {
  const boardStateContract = new BoardStateEngineContract();

  const cbmContract = new ChessBoardMagicApiContract();

  const chessDbContract = new ChessDbApiContract();

  const dojoContract = new ChessDojoApiContract();

  const lichessContract = new LichessContract();

  const netsContract = new NNEDBApiContract();

  const posiraContract = new PosiraApiContract();

  const sfContract = new StockfishApiContract();

  const themeContract = new ThemeApiContract();

  const utilContract = new UtilEngineContract();

  const handshakePerformer = new MCPContractHandshakeStrategy(
    mcpServer,
    [
      boardStateContract,
      cbmContract,
      chessDbContract,
      dojoContract,
      lichessContract,
      netsContract,
      posiraContract,
      sfContract,
      themeContract,
      utilContract,
    ],
    isRemoteEnvEnabled,
  );

  handshakePerformer.applyBulkContracts();
}
