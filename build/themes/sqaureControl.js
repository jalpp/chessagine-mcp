import { getPiecePlacement } from "./piecePlacement.js";
export function getSideSquareControl(chess, side) {
    const placement = getPiecePlacement(chess, side);
    const lightSquares = [];
    const darkSquares = [];
    const allSquares = [...placement.knightplacement, ...placement.bishopplacement, ...placement.pawnplacement, ...placement.queenplacement, ...placement.rookplacement, ...placement.kingplacement];
    for (const square of allSquares) {
        if (chess.squareColor(square) === "light") {
            lightSquares.push(square);
        }
        else {
            darkSquares.push(square);
        }
    }
    return {
        lightSquareControl: lightSquares.length,
        darkSqaureControl: darkSquares.length,
        lightSquares: lightSquares,
        darkSquares: darkSquares
    };
}
