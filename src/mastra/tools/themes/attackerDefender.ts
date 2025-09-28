import { Chess, Color, WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, PieceSymbol, Square } from "chess.js";
import { SideAttackerDefenders, PieceAttackDefendInfo } from "../types";

export function getSideAttackerDefenderInfo(chess: Chess, side: Color): SideAttackerDefenders {
  const enemySide = side === WHITE ? BLACK : WHITE;
  return {
    pawnInfo: getPieceAttDefInfo(PAWN, chess, side, enemySide),
    knightInfo: getPieceAttDefInfo(KNIGHT, chess, side, enemySide),
    bishopInfo: getPieceAttDefInfo(BISHOP, chess, side, enemySide),
    rookInfo: getPieceAttDefInfo(ROOK, chess, side, enemySide),
    queenInfo: getPieceAttDefInfo(QUEEN, chess, side, enemySide),
    kingInfo: undefined
  };
  
}

export function getPieceAttDefInfo(piece: PieceSymbol, chess: Chess, side: Color, enemySide: Color): PieceAttackDefendInfo {
  const pieceSquares = chess.findPiece({type: piece, color: side});

  const enemyAttackers: Square[] = [];
  const enemyDefenders: Square[] = [];

  for(let i = 0; i < pieceSquares.length; i++){
     const attackers = chess.attackers(pieceSquares[i], enemySide);
     const defenders = chess.attackers(pieceSquares[i], side);
    enemyAttackers.push(...attackers);
    enemyDefenders.push(...defenders);
  }

  return {
    attackers: enemyAttackers,
    defenders: enemyDefenders,
    attackerscount: enemyAttackers.length,
    defenderscount: enemyDefenders.length
  }


}