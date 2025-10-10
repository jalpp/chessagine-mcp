import { KING, QUEEN, BISHOP, KNIGHT, ROOK, PAWN } from "chess.js";
export function getPiecePlacement(chess, side) {
    return {
        kingplacement: chess.findPiece({ type: KING, color: side }),
        queenplacement: chess.findPiece({ type: QUEEN, color: side }),
        bishopplacement: chess.findPiece({ type: BISHOP, color: side }),
        knightplacement: chess.findPiece({ type: KNIGHT, color: side }),
        rookplacement: chess.findPiece({ type: ROOK, color: side }),
        pawnplacement: chess.findPiece({ type: PAWN, color: side }),
    };
}
