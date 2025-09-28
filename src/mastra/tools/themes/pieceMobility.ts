import { Color, Chess, PAWN, WHITE, BLACK, Square, KING, QUEEN, ROOK, BISHOP, KNIGHT } from "chess.js";
import { PieceMobility } from "../types";
import { getPiecePlacement } from "./piecePlacement";


function getSidePieces(chess: Chess, side: Color): string[] {
  const pieces = getPiecePlacement(chess, side);

  return [
    ...pieces.kingplacement,
    ...pieces.queenplacement,
    ...pieces.bishopplacement,
    ...pieces.knightplacement,
    ...pieces.rookplacement,
    ...pieces.pawnplacement,
  ];
}

export function getPieceMobility(fen: string, side: Color): PieceMobility {
  const chess = new Chess(fen);
  const originalTurn = chess.turn();

  // If the turn is not the side we're analyzing, temporarily set it
  if (originalTurn !== side) {
    const fenParts = fen.split(' ');
    fenParts[1] = side; // set turn to the desired side
    chess.load(fenParts.join(' '));
  }

  const pieces = getSidePieces(chess, side);
  let queenMobility = 0, rookMobility = 0, bishopMobility = 0, knightMobility = 0;

  for (const square of pieces) {
    const piece = chess.get(square as Square);
    if (!piece) continue;

    const moves = chess.moves({square: square as Square, verbose: true});
    const mobility = moves.length;

    switch (piece.type) {
      case QUEEN: queenMobility += mobility; break;
      case ROOK: rookMobility += mobility; break;
      case BISHOP: bishopMobility += mobility; break;
      case KNIGHT: knightMobility += mobility; break;
    }
  }

  return {
    queenmobility: queenMobility,
    rookmobility: rookMobility,
    bishopmobility: bishopMobility,
    knightmobility: knightMobility,
    totalmobility: queenMobility + rookMobility + bishopMobility + knightMobility
  };
}