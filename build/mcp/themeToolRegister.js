import z from "zod";
import { fenSchema, gamePgnSchema, sideSchema } from "../runner/schema.js";
import { generateGameReview, formatGameReview } from "../review/gamereview.js";
import { getThemeScores, analyzeVariationThemes, getThemeProgression, compareVariations, findCriticalMoments } from "../review/ovp.js";
import { validColorSchema } from "../utils/utils.js";
import { TacticalBoard } from "../themes/tacticalBoard.js";
export function registerThemeCalculationTools(server) {
    server.tool("get-theme-scores", "Get chess theme scores (material, mobility, space, positional, king safety) for a given position fen and the side to eval from", {
        fen: fenSchema,
        color: sideSchema,
    }, async ({ fen, color }) => {
        try {
            const validColor = validColorSchema(color);
            const result = getThemeScores(fen, validColor);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting theme scores:`,
                    },
                ],
            };
        }
    });
    server.tool("get-tactical-position-summary", "Get tactical position summary like hanging pieces, semi protected pieces, forks, pins for the given fen", {
        fen: fenSchema
    }, async ({ fen }) => {
        try {
            const tactics = new TacticalBoard(fen);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(tactics.toString(), null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting theme scores:`,
                    },
                ],
            };
        }
    });
    server.tool("analyze-variation-themes", "Analyze how chess themes change across a sequence of moves", {
        rootFen: fenSchema,
        moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
        color: sideSchema,
    }, async ({ rootFen, moves, color }) => {
        try {
            const validColor = validColorSchema(color);
            const result = analyzeVariationThemes(rootFen, moves, validColor);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error analyzing variation themes:`,
                    },
                ],
            };
        }
    });
    server.tool("get-theme-progression", "Get the progression of a specific chess theme over a variation", {
        rootFen: fenSchema,
        moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
        color: sideSchema,
        theme: z.enum([
            "material",
            "mobility",
            "space",
            "pawnStructure",
            "kingSafety",
        ]).describe("Theme to track"),
    }, async ({ rootFen, moves, color, theme }) => {
        try {
            const validColor = validColorSchema(color);
            const result = getThemeProgression(rootFen, moves, validColor, theme);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting theme progression:`,
                    },
                ],
            };
        }
    });
    server.tool("compare-variations", "Compare multiple chess variations and return their theme analyses", {
        rootFen: fenSchema,
        variations: z.array(z.object({
            name: z.string(),
            moves: z.array(z.string()),
        })).describe("Array of variations to compare"),
        color: sideSchema,
    }, async ({ rootFen, variations, color }) => {
        try {
            const validColor = validColorSchema(color);
            const result = compareVariations(rootFen, variations, validColor);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error comparing variations`,
                    },
                ],
            };
        }
    });
    server.tool("find-critical-moments", "Find moves in a chess variation where there are significant theme changes", {
        rootFen: fenSchema,
        moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
        color: sideSchema,
        threshold: z.number().optional().default(0.5).describe("Threshold for significant changes"),
    }, async ({ rootFen, moves, color, threshold = 0.5 }) => {
        try {
            const validColor = validColorSchema(color);
            const result = findCriticalMoments(rootFen, moves, validColor, threshold);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error finding critical moments:`,
                    },
                ],
            };
        }
    });
    server.tool("generate-game-review", "Generate a comprehensive game review with theme progression analysis from a PGN. Analyzes material, mobility, space, positional play, and king safety for both players throughout the game.", {
        pgn: gamePgnSchema,
        criticalMomentThreshold: z.number()
            .min(0.1)
            .max(2.0)
            .default(0.5)
            .optional()
            .describe("Threshold for identifying critical moments (default: 0.5). Lower values find more moments."),
        format: z.enum(["json", "text"])
            .default("text")
            .optional()
            .describe("Output format: 'json' for structured data or 'text' for human-readable report"),
    }, async ({ pgn, criticalMomentThreshold = 0.5, format = "text" }) => {
        try {
            const review = generateGameReview(pgn, criticalMomentThreshold);
            if (format === "json") {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(review, null, 2),
                        },
                    ],
                };
            }
            const formattedReview = formatGameReview(review);
            let detailedOutput = formattedReview + "\n\n";
            detailedOutput += "=== DETAILED THEME CHANGES ===\n\n";
            detailedOutput += "WHITE:\n";
            review.whiteAnalysis.overallThemes.themeChanges.forEach(tc => {
                detailedOutput += `  ${tc.theme}: ${tc.initialScore.toFixed(2)} → ${tc.finalScore.toFixed(2)} `;
                detailedOutput += `(${tc.change > 0 ? '+' : ''}${tc.change.toFixed(2)}, ${tc.percentChange.toFixed(1)}%)\n`;
            });
            detailedOutput += "\nBLACK:\n";
            review.blackAnalysis.overallThemes.themeChanges.forEach(tc => {
                detailedOutput += `  ${tc.theme}: ${tc.initialScore.toFixed(2)} → ${tc.finalScore.toFixed(2)} `;
                detailedOutput += `(${tc.change > 0 ? '+' : ''}${tc.change.toFixed(2)}, ${tc.percentChange.toFixed(1)}%)\n`;
            });
            if (review.whiteAnalysis.criticalMoments.length > 0) {
                detailedOutput += "\n=== WHITE'S CRITICAL MOMENTS ===\n";
                review.whiteAnalysis.criticalMoments.forEach((cm, i) => {
                    const moveNum = Math.floor(cm.moveIndex / 2) + 1;
                    detailedOutput += `\nMove ${moveNum}: ${cm.move}\n`;
                    cm.themeChanges.forEach(tc => {
                        detailedOutput += `  ${tc.theme}: ${tc.change > 0 ? '+' : ''}${tc.change.toFixed(2)}\n`;
                    });
                });
            }
            if (review.blackAnalysis.criticalMoments.length > 0) {
                detailedOutput += "\n=== BLACK'S CRITICAL MOMENTS ===\n";
                review.blackAnalysis.criticalMoments.forEach((cm, i) => {
                    const moveNum = Math.floor(cm.moveIndex / 2) + 1;
                    detailedOutput += `\nMove ${moveNum}: ${cm.move}\n`;
                    cm.themeChanges.forEach(tc => {
                        detailedOutput += `  ${tc.theme}: ${tc.change > 0 ? '+' : ''}${tc.change.toFixed(2)}\n`;
                    });
                });
            }
            return {
                content: [
                    {
                        type: "text",
                        text: detailedOutput,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error generating game review: ${error instanceof Error ? error.message : 'Invalid PGN or analysis error'}`,
                    },
                ],
            };
        }
    });
}
