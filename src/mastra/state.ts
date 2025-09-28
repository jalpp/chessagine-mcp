"use server";
import { BLACK, QUEEN, KING, validateFen, WHITE, Chess } from "chess.js";
import { BoardState, SideStateScores } from "./types.js";
import { getGamePhase } from "./gamePhase.js";
import { getMaterialInfo } from "./material.js";
import { getSidePositionalCount } from "./positional.js";
import { getSideAttackerDefenderInfo } from "./attackerDefender.js";
import { getPiecePlacement } from "./piecePlacement.js";
import { getSideSpaceControl } from "./spaceControl.js";
import { getSideSquareControl } from "./sqaureControl.js";
import { getKingSafety } from "./kingSafety.js";
import { getPieceMobility } from "./pieceMobility.js";

export function calculateDeep(
  fen: string,
  move: string
): BoardState | undefined {
  const chess = new Chess(fen);
  chess.move(move);
  return getBoardState(chess.fen());
}

export function getBoardState(fen: string): BoardState {
  const chess = new Chess(fen);
  const validfen = validateFen(fen).ok;
  if (!validfen) {
    return {} as BoardState;
  }

  const whitecastlerights = {
    queenside: chess.getCastlingRights(WHITE)[QUEEN],
    kingside: chess.getCastlingRights(WHITE)[KING],
  };

  const blackcastlerights = {
    queenside: chess.getCastlingRights(BLACK)[QUEEN],
    kingside: chess.getCastlingRights(BLACK)[KING],
  };

  const legalMoves = chess.moves();
  const isCheckmate = chess.isCheckmate();
  const isStalemate = chess.isStalemate();
  const isGameOver = chess.isGameOver();
  const moveNumber = chess.moveNumber();
  const sidetomove = chess.turn() === "w" ? "white" : "black";
  const gamePhase = getGamePhase(chess);

  const whiteScores: SideStateScores = {
    castlingScore: whitecastlerights,
    materialScore: getMaterialInfo(chess, WHITE),
    spaceScore: getSideSpaceControl(chess, WHITE),
    pieceplacementScore: getPiecePlacement(chess, WHITE),
    positionalScore: getSidePositionalCount(chess, WHITE),
    squareControlScore: getSideSquareControl(chess, WHITE),
    kingSafetyScore: getKingSafety(chess, WHITE),
    pieceMobilityScore: getPieceMobility(fen, WHITE),
  };

  const blackScores: SideStateScores = {
    castlingScore: blackcastlerights,
    materialScore: getMaterialInfo(chess, BLACK),
    spaceScore: getSideSpaceControl(chess, BLACK),
    pieceplacementScore: getPiecePlacement(chess, BLACK),
    positionalScore: getSidePositionalCount(chess, BLACK),
    squareControlScore: getSideSquareControl(chess, BLACK),
    kingSafetyScore: getKingSafety(chess, BLACK),
    pieceMobilityScore: getPieceMobility(fen, BLACK),
  };

  return {
    fen,
    validfen,
    legalMoves,
    white: whiteScores,
    black: blackScores,
    whitepieceattackerdefenderinfo: getSideAttackerDefenderInfo(chess, WHITE),
    blackpieceattackerdefenderinfo: getSideAttackerDefenderInfo(chess, BLACK),
    isCheckmate,
    isStalemate,
    isGameOver,
    moveNumber,
    sidetomove,
    gamePhase,
  };
}
