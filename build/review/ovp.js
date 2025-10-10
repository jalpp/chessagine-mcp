import { Chess } from "chess.js";
import { PositionScorer } from "../themes/positionScorer.js";
import { STATE_THEMES } from "../types/types.js";
function collectFenList(rootFen, moves) {
    const collectedFen = [];
    if (moves.length == 0) {
        return [];
    }
    const chess = new Chess(rootFen);
    for (let i = 0; i < moves.length; i++) {
        chess.move(moves[i]);
        collectedFen[i] = chess.fen();
    }
    return collectedFen;
}
export function getThemeScores(fen, color) {
    const scorer = new PositionScorer(fen, color);
    return {
        material: scorer.getThemeScore(STATE_THEMES.MATERIAL),
        mobility: scorer.getThemeScore(STATE_THEMES.MOBILITY),
        space: scorer.getThemeScore(STATE_THEMES.SPACE),
        pawnStructure: scorer.getThemeScore(STATE_THEMES.POSITIONAL),
        kingSafety: scorer.getThemeScore(STATE_THEMES.KING_SAFETY)
    };
}
export function analyzeVariationThemes(rootFen, moves, color) {
    if (moves.length === 0) {
        const rootScores = getThemeScores(rootFen, color);
        return {
            themeChanges: [],
            overallChange: 0,
            strongestImprovement: null,
            biggestDecline: null,
            moveByMoveScores: [rootScores]
        };
    }
    const fens = [rootFen, ...collectFenList(rootFen, moves)];
    const moveByMoveScores = fens.map(fen => getThemeScores(fen, color));
    const initialScores = moveByMoveScores[0];
    const finalScores = moveByMoveScores[moveByMoveScores.length - 1];
    const themeNames = ['material', 'mobility', 'space', 'pawnStructure', 'kingSafety'];
    const themeChanges = themeNames.map(theme => {
        const initial = initialScores[theme];
        const final = finalScores[theme];
        const change = final - initial;
        const percentChange = initial !== 0 ? (change / Math.abs(initial)) * 100 : 0;
        return {
            theme,
            initialScore: initial,
            finalScore: final,
            change,
            percentChange
        };
    });
    const overallChange = themeChanges.reduce((sum, change) => sum + change.change, 0);
    const strongestImprovement = themeChanges
        .filter(change => change.change > 0)
        .sort((a, b) => b.change - a.change)[0] || null;
    const biggestDecline = themeChanges
        .filter(change => change.change < 0)
        .sort((a, b) => a.change - b.change)[0] || null;
    return {
        themeChanges,
        overallChange,
        strongestImprovement,
        biggestDecline,
        moveByMoveScores
    };
}
export function getThemeProgression(rootFen, moves, color, theme) {
    if (moves.length === 0) {
        return [getThemeScores(rootFen, color)[theme]];
    }
    const fens = [rootFen, ...collectFenList(rootFen, moves)];
    return fens.map(fen => getThemeScores(fen, color)[theme]);
}
export function compareVariations(rootFen, variations, color) {
    return variations.map(variation => ({
        name: variation.name,
        analysis: analyzeVariationThemes(rootFen, variation.moves, color)
    }));
}
export function findCriticalMoments(rootFen, moves, color, threshold = 0.5) {
    if (moves.length === 0)
        return [];
    const criticalMoments = [];
    const fens = [rootFen, ...collectFenList(rootFen, moves)];
    for (let i = 1; i < fens.length; i++) {
        const previousScores = getThemeScores(fens[i - 1], color);
        const currentScores = getThemeScores(fens[i], color);
        const themeNames = ['material', 'mobility', 'space', 'pawnStructure', 'kingSafety'];
        const moveThemeChanges = themeNames.map(theme => {
            const initial = previousScores[theme];
            const final = currentScores[theme];
            const change = final - initial;
            const percentChange = initial !== 0 ? (change / Math.abs(initial)) * 100 : 0;
            return {
                theme,
                initialScore: initial,
                finalScore: final,
                change,
                percentChange
            };
        });
        const significantChanges = moveThemeChanges.filter(change => Math.abs(change.change) >= threshold);
        if (significantChanges.length > 0) {
            criticalMoments.push({
                moveIndex: i - 1,
                move: moves[i - 1],
                themeChanges: significantChanges
            });
        }
    }
    return criticalMoments;
}
