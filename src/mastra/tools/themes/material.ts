import { MaterialInfo, PIECE_VALUES } from "../types";
import { Chess, Color, PAWN, KNIGHT, BISHOP, ROOK, QUEEN } from "chess.js";
import { getPiecePlacement } from "./piecePlacement";

export function getMaterialInfo(chess: Chess, side: Color): MaterialInfo {

  const pieces = getPiecePlacement(chess, side);
  
  const counts = {
    pawns: pieces.pawnplacement.length,
    knights: pieces.knightplacement.length,
    bishops: pieces.bishopplacement.length,
    rooks: pieces.rookplacement.length,
    queens: pieces.queenplacement.length,
  };

  const materialValue = 
    counts.pawns * PIECE_VALUES[PAWN] +
    counts.knights * PIECE_VALUES[KNIGHT] +
    counts.bishops * PIECE_VALUES[BISHOP] +
    counts.rooks * PIECE_VALUES[ROOK] +
    counts.queens * PIECE_VALUES[QUEEN];

  return {
    materialcount: counts.rooks + counts.bishops + counts.pawns + counts.knights,
    materialvalue: materialValue,
    piececount: counts,
    bishoppair: counts.bishops >= 2
  };
}