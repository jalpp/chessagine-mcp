import { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN } from "chess.js";
export function getSideAttackerDefenderInfo(chess, side) {
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
export function getPieceAttDefInfo(piece, chess, side, enemySide) {
    const pieceSquares = chess.findPiece({ type: piece, color: side });
    const enemyAttackers = [];
    const enemyDefenders = [];
    for (let i = 0; i < pieceSquares.length; i++) {
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
    };
}
