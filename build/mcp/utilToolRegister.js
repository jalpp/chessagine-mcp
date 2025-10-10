import { getKnowledgeBase } from "../tools/knowlegebase.js";
import { PROMPT_CATEGORIES } from "../utils/utils.js";
import { PUZZLE_THEMES } from "../tools/puzzle.js";
import { gamePgnSchema } from "../runner/schema.js";
import { collectFensFromGame } from "../utils/utils.js";
export function registerUtilsTools(server) {
    server.tool("get-chess-knowledgebase", "Returns a comprehensive chess knowledgebase including Silman Imbalances, Fine's 30 chess principles, endgame principles, and practical checklists", {}, async () => {
        try {
            const knowledge = getKnowledgeBase();
            return {
                content: [
                    {
                        type: "text",
                        text: knowledge,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting chess knowledge base:`,
                    },
                ],
            };
        }
    });
    server.tool("get-chessagine-stater-prompts", "List all available chess analysis prompt categories with their example prompts", {}, async () => {
        const categories = Object.entries(PROMPT_CATEGORIES).map(([key, value]) => ({
            id: key,
            name: value.name,
            promptCount: value.prompts.length
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(categories, null, 2)
                }
            ],
        };
    });
    server.tool("get-puzzle-themes", "Get a list of all available puzzle themes that can be used to filter puzzles", {}, async () => {
        try {
            const themes = PUZZLE_THEMES.map(theme => ({
                tag: theme.tag,
                description: theme.description,
            }));
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            totalThemes: themes.length,
                            themes: themes,
                            popularThemes: [
                                "fork", "pin", "skewer", "discoveredAttack",
                                "mateIn1", "mateIn2", "mateIn3",
                                "hangingPiece", "sacrifice", "deflection"
                            ],
                            difficultyThemes: [
                                "mateIn1", "mateIn2", "mateIn3", "mateIn4", "mateIn5",
                                "short", "long", "veryLong"
                            ],
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting puzzle themes: ${error}`,
                    },
                ],
            };
        }
    });
    server.tool("parse-pgn-into-fens", "Collect a fen list of given game pgn", {
        pgn: gamePgnSchema,
    }, async ({ pgn }) => {
        try {
            const fens = collectFensFromGame(pgn);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            fens: fens
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `invalid PGN`,
                    },
                ],
            };
        }
    });
}
