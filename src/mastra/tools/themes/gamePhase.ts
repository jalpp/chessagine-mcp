
import { Chess } from "chess.js";
import { PIECE_VALUES } from "../types";

export function getGamePhase(chess: Chess): 'opening' | 'middlegame' | 'endgame' {
  const fen = chess.fen();
  const moveNumber = parseInt(fen.split(' ')[5]) || 1; // Full move number
  const totalMaterial = getTotalMaterialValue(chess);
  
  // Count major pieces (queens and rooks) and minor pieces (bishops and knights)
  let queens = 0;
  let rooks = 0;
  let minorPieces = 0; // bishops + knights
  let totalPieces = 0;
  
  const board = chess.board();
  for (const row of board) {
    for (const square of row) {
      if (square) {
        switch (square.type) {
          case 'q': queens++; break;
          case 'r': rooks++; break;
          case 'b':
          case 'n': minorPieces++; break;
          case 'p':
          case 'k': break; // Count separately or not at all
        }
        if (square.type !== 'k') totalPieces++; // Don't count kings
      }
    }
  }
  
  // Check if pieces have been developed (not in starting positions)
  const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const isStartingPosition = chess.fen().split(' ')[0] === startingFen.split(' ')[0];
  
  // ENDGAME CRITERIA (most restrictive first)
  // Classic endgame: Very low material or specific piece combinations
  if (totalMaterial <= 10 || // Very few pieces left
      (queens === 0 && rooks <= 2 && minorPieces <= 2) || // No queens, minimal pieces
      (queens <= 1 && rooks === 0 && minorPieces <= 1) || // Queen vs minimal pieces
      (totalPieces <= 6)) { // Very few total pieces
    return 'endgame';
  }
  
  // OPENING CRITERIA
  // Early in the game with most pieces still on board
  if (moveNumber <= 12 || // Very early moves
      isStartingPosition ||
      (totalMaterial >= 30 && moveNumber <= 20) || // High material, early moves
      (queens === 2 && rooks === 4 && minorPieces >= 6)) { // Most pieces undeveloped
    return 'opening';
  }
  
  // ENDGAME CRITERIA (broader check after opening is ruled out)
  if (totalMaterial <= 20 || // Low material threshold
      queens === 0 || // No queens typically indicates endgame
      (queens === 1 && totalMaterial <= 25) || // Single queen with low material
      totalPieces <= 10) { // Limited pieces remaining
    return 'endgame';
  }
  
  // Everything else is middlegame
  return 'middlegame';
}

export function getTotalMaterialValue(chess: Chess): number {
  let total = 0;
  const board = chess.board();
  
  for (const row of board) {
    for (const piece of row) {
      if (piece) {
        total += PIECE_VALUES[piece.type] || 0;
      }
    }
  }
  return total;
}