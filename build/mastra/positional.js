import { WHITE, BLACK, PAWN } from "chess.js";
export function getSidePositionalCount(chess, side) {
    const pawnSquares = chess.findPiece({ type: PAWN, color: side });
    const doublePawns = getDoublePawnCount(pawnSquares);
    const isolatedPawnCount = getSideIsolatedPawnCount(pawnSquares);
    const backwardPawnCount = getSideBackwardPawnCount(chess, pawnSquares, side);
    const passedPawnCount = getPassedPawnCount(chess, side);
    const totalPawns = pawnSquares.length;
    const weaknessScore = totalPawns > 0
        ? Math.round(((doublePawns + isolatedPawnCount + backwardPawnCount) / totalPawns) * 100)
        : 0;
    return {
        doublepawncount: doublePawns,
        isolatedpawncount: isolatedPawnCount,
        backwardpawncount: backwardPawnCount,
        passedpawncount: passedPawnCount,
        weaknessscore: weaknessScore,
    };
}
function getPassedPawnCount(chess, side) {
    const enemySide = side === WHITE ? BLACK : WHITE;
    const myPawns = chess.findPiece({ type: PAWN, color: side });
    const enemyPawns = chess.findPiece({ type: PAWN, color: enemySide });
    let passedCount = 0;
    for (const pawnSquare of myPawns) {
        const file = pawnSquare[0];
        const rank = parseInt(pawnSquare[1]);
        const direction = side === WHITE ? 1 : -1;
        let isPassed = true;
        // Check if any enemy pawns block this pawn's path or can capture it
        for (const enemyPawn of enemyPawns) {
            const enemyFile = enemyPawn[0];
            const enemyRank = parseInt(enemyPawn[1]);
            // Check same file and adjacent files (capture squares)
            const fileDiff = Math.abs(enemyFile.charCodeAt(0) - file.charCodeAt(0));
            if (fileDiff <= 1) {
                // For white pawns, enemy pawns ahead block the path
                if (side === WHITE && enemyRank > rank) {
                    isPassed = false;
                    break;
                }
                // For black pawns, enemy pawns behind (lower rank) block the path  
                else if (side === BLACK && enemyRank < rank) {
                    isPassed = false;
                    break;
                }
            }
        }
        if (isPassed) {
            passedCount++;
        }
    }
    return passedCount;
}
function getSideIsolatedPawnCount(pawnSquares) {
    const pawnFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const filesWithPawns = new Set(pawnSquares.map(sq => sq[0]));
    let isolatedCount = 0;
    for (const file of filesWithPawns) {
        const fileIndex = pawnFiles.indexOf(file);
        const hasLeftNeighbor = fileIndex > 0 && filesWithPawns.has(pawnFiles[fileIndex - 1]);
        const hasRightNeighbor = fileIndex < 7 && filesWithPawns.has(pawnFiles[fileIndex + 1]);
        if (!hasLeftNeighbor && !hasRightNeighbor) {
            // Count how many pawns are on this isolated file
            isolatedCount += pawnSquares.filter(sq => sq[0] === file).length;
        }
    }
    return isolatedCount;
}
function getSideBackwardPawnCount(chess, pawnSquares, side) {
    const pawnMap = new Map();
    // Group pawns by file
    for (const square of pawnSquares) {
        const file = square[0];
        const rank = parseInt(square[1], 10);
        if (!pawnMap.has(file))
            pawnMap.set(file, []);
        pawnMap.get(file)?.push(rank);
    }
    let backwardCount = 0;
    for (const [file, ranks] of pawnMap.entries()) {
        // Sort ranks appropriately for the side
        ranks.sort((a, b) => side === WHITE ? b - a : a - b);
        const fileIndex = "abcdefgh".indexOf(file);
        const leftRanks = fileIndex > 0 ? pawnMap.get("abcdefgh"[fileIndex - 1]) || [] : [];
        const rightRanks = fileIndex < 7 ? pawnMap.get("abcdefgh"[fileIndex + 1]) || [] : [];
        // Get the most advanced friendly pawns on adjacent files
        const mostAdvancedLeft = side === WHITE
            ? Math.max(...leftRanks, 0)
            : Math.min(...leftRanks, 9);
        const mostAdvancedRight = side === WHITE
            ? Math.max(...rightRanks, 0)
            : Math.min(...rightRanks, 9);
        for (const rank of ranks) {
            // A pawn is backward if it cannot advance safely and is behind neighboring pawns
            let isBackward = false;
            if (side === WHITE) {
                // For white, backward if behind both neighbors and cannot advance
                if (rank < mostAdvancedLeft && rank < mostAdvancedRight) {
                    // Check if the square in front is attacked by enemy pawns or occupied
                    const nextRank = rank + 1;
                    if (nextRank <= 8 && !canAdvanceSafely(chess, file + nextRank, side)) {
                        isBackward = true;
                    }
                }
            }
            else {
                // For black, backward if behind both neighbors and cannot advance
                if (rank > mostAdvancedLeft && rank > mostAdvancedRight) {
                    // Check if the square in front is attacked by enemy pawns or occupied
                    const nextRank = rank - 1;
                    if (nextRank >= 1 && !canAdvanceSafely(chess, file + nextRank, side)) {
                        isBackward = true;
                    }
                }
            }
            if (isBackward) {
                backwardCount++;
            }
        }
    }
    return backwardCount;
}
function canAdvanceSafely(chess, square, side) {
    // Check if the square is occupied
    const piece = chess.get(square);
    if (piece) {
        return false;
    }
    // Check if the square is attacked by enemy pawns
    const enemySide = side === WHITE ? BLACK : WHITE;
    const enemyPawns = chess.findPiece({ type: PAWN, color: enemySide });
    const file = square[0];
    const rank = parseInt(square[1]);
    for (const enemyPawn of enemyPawns) {
        const enemyFile = enemyPawn[0];
        const enemyRank = parseInt(enemyPawn[1]);
        // Check if this enemy pawn can capture on the target square
        const fileDiff = Math.abs(enemyFile.charCodeAt(0) - file.charCodeAt(0));
        if (fileDiff === 1) { // Adjacent files
            if (enemySide === WHITE && enemyRank + 1 === rank) {
                return false; // White pawn can capture
            }
            else if (enemySide === BLACK && enemyRank - 1 === rank) {
                return false; // Black pawn can capture
            }
        }
    }
    return true;
}
function getDoublePawnCount(pawnSquares) {
    const fileCounts = new Map();
    for (const square of pawnSquares) {
        const file = square[0];
        fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
    }
    let doublePawns = 0;
    for (const count of fileCounts.values()) {
        if (count > 1) {
            doublePawns += count - 1; // Each extra pawn beyond the first is a doubled pawn
        }
    }
    return doublePawns;
}
