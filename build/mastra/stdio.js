#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getOpeningStatSpeech, getLichessOpeningStats, getOpeningStats } from "./opening.js";
import { calculateDeep, getBoardState } from "./state.js";
import { generateChessAnalysis, getChessEvaluation } from "./fish.js";
import { getKnowledgeBase } from "./knowlegebase.js";
import { getThemeProgression, getThemeScores, analyzeVariationThemes, findCriticalMoments, compareVariations, } from "./ovp.js";
import { PositionPrompter } from "./positionPrompter.js";
import { agineDesigner, agineSystemPrompt, chessAgineAnnoPrompt } from "./prompt.js";
import { collectFensFromGame, getChessDbNoteWord } from "./utils.js";
import { fetchPuzzle, getDifficultyLevel, getThemeDescriptions, PUZZLE_THEMES } from "./puzzle.js";
import { viewBoardArtifact } from "./imageRenderArififact.js";
import { formatGameReview, generateGameReview } from "./gamereview.js";
import { gameRenderHtml } from "./gameRender.js";
// Create server instance
const server = new McpServer({
    name: "chessagine-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
console.error("Starting chessagine-mcp server...");
// Schema definitions
const fenSchema = z
    .string()
    .regex(/^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [bw] [KQkq-]+ [a-h][1-8]|[a-h][1-8]|[a-h][1-8]|[a-h][1-8]|- \d+ \d+$/, "Invalid FEN format").describe("FEN string representing the board position");
const moveSchema = z
    .string()
    .min(2)
    .max(7)
    .describe("Algebraic chess move like 'e4', 'Nf3', 'O-O'");
const colorSchema = z.enum(["w", "b"]).describe("Side to evaluate from");
// Register tools
// 1. Get Theme Scores
server.tool("get-theme-scores", "Get chess theme scores (material, mobility, space, positional, king safety) for a given position fen and the side to eval from", {
    fen: fenSchema,
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
}, async ({ fen, color }) => {
    try {
        const result = getThemeScores(fen, color);
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
// 2. Analyze Variation Themes
server.tool("analyze-variation-themes", "Analyze how chess themes change across a sequence of moves", {
    rootFen: fenSchema,
    moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
}, async ({ rootFen, moves, color }) => {
    try {
        const result = analyzeVariationThemes(rootFen, moves, color);
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
// 3. Get Theme Progression
server.tool("get-theme-progression", "Get the progression of a specific chess theme over a variation", {
    rootFen: fenSchema,
    moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
    theme: z.enum([
        "material",
        "mobility",
        "space",
        "pawnStructure",
        "kingSafety",
    ]).describe("Theme to track"),
}, async ({ rootFen, moves, color, theme }) => {
    try {
        const result = getThemeProgression(rootFen, moves, color, theme);
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
// 4. Compare Variations
server.tool("compare-variations", "Compare multiple chess variations and return their theme analyses", {
    rootFen: fenSchema,
    variations: z.array(z.object({
        name: z.string(),
        moves: z.array(z.string()),
    })).describe("Array of variations to compare"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
}, async ({ rootFen, variations, color }) => {
    try {
        const result = compareVariations(rootFen, variations, color);
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
// 5. Find Critical Moments
server.tool("find-critical-moments", "Find moves in a chess variation where there are significant theme changes", {
    rootFen: fenSchema,
    moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
    threshold: z.number().optional().default(0.5).describe("Threshold for significant changes"),
}, async ({ rootFen, moves, color, threshold = 0.5 }) => {
    try {
        const result = findCriticalMoments(rootFen, moves, color, threshold);
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
// 6. Get Stockfish Analysis
server.tool("get-stockfish-analysis", "Analyze a given chess position using Stockfish and provide best move, reasoning, and variation, speech Eval and number Eval", {
    fen: fenSchema,
    depth: z.number().min(12).max(15).describe("Search depth for Stockfish engine"),
}, async ({ fen, depth }) => {
    try {
        const evaluation = await getChessEvaluation(fen, depth);
        const result = generateChessAnalysis(evaluation, fen);
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
                    text: `Error getting Stockfish analysis:`,
                },
            ],
        };
    }
});
// 7. Get Stockfish Move Analysis
server.tool("get-stockfish-move-analysis", "Analyze a given chess position after a specific move using Stockfish and provide best move, reasoning, variation, speech eval, and number eval", {
    fen: fenSchema,
    move: z.string().describe("The move to be played in UCI or SAN format"),
}, async ({ fen, move }) => {
    try {
        // calculateDeep returns the new FEN after the move
        const newFen = calculateDeep(fen, move)?.fen || fen;
        const evaluation = await getChessEvaluation(newFen, 15);
        const result = generateChessAnalysis(evaluation, newFen);
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
                    text: `Error getting Stockfish move analysis:`,
                },
            ],
        };
    }
});
// 8. Is Legal Move
server.tool("is-legal-move", "Check if a given move is legal for the provided FEN position", {
    fen: z.string().describe("FEN string representing the board position, the fen must be in full form containing which side to move"),
    move: z.string().describe("Move to check (in SAN or UCI format)"),
}, async ({ fen, move }) => {
    try {
        const boardState = getBoardState(fen);
        if (!boardState) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ isLegal: false, message: "Invalid FEN string" }, null, 2),
                    },
                ],
            };
        }
        const legalMoves = boardState.legalMoves || [];
        const moveToCheck = move.trim();
        const isLegal = legalMoves.includes(moveToCheck) ||
            legalMoves.map((m) => m.toLowerCase()).includes(moveToCheck.toLowerCase());
        const result = {
            isLegal,
            message: isLegal
                ? "Move is legal."
                : "Move is not legal in this position.",
        };
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
                    text: JSON.stringify({ isLegal: false, message: "Error checking move legality." }, null, 2),
                },
            ],
        };
    }
});
// 9. Board State to Prompt
server.tool("boardstate-to-prompt", "Given a FEN and a move, returns a string describing the resulting board state after the move", {
    fen: fenSchema,
    move: z.string().describe("The move to be played (in SAN or UCI format)"),
}, async ({ fen, move }) => {
    try {
        const boardState = calculateDeep(fen, move);
        if (!boardState || !boardState.validfen) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Invalid move or FEN. Cannot generate board state prompt.",
                    },
                ],
            };
        }
        const prompt = new PositionPrompter(boardState).generatePrompt();
        return {
            content: [
                {
                    type: "text",
                    text: prompt,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error generating board state prompt:`,
                },
            ],
        };
    }
});
// 11. Get Lichess Master Games
server.tool("get-lichess-master-games", "Fetch master-level games and opening statistics from Lichess for a given position", {
    fen: fenSchema,
}, async ({ fen }) => {
    const masterData = await getOpeningStats(fen);
    if (!masterData) {
        return {
            content: [
                {
                    type: "text",
                    text: "No master game data available for this position.",
                },
            ],
        };
    }
    const speech = getOpeningStatSpeech(masterData);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    data: masterData,
                    analysis: speech
                }, null, 2),
            },
        ],
    };
});
// 12. Get Lichess Games
server.tool("get-lichess-games", "Fetch Lichess user games and opening statistics for a given position", {
    fen: fenSchema,
}, async ({ fen }) => {
    const lichessData = await getLichessOpeningStats(fen);
    if (!lichessData) {
        return {
            content: [
                {
                    type: "text",
                    text: "No Lichess game data available for this position.",
                },
            ],
        };
    }
    const speech = getOpeningStatSpeech(lichessData);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    data: lichessData,
                    analysis: speech
                }, null, 2),
            },
        ],
    };
});
// 13. Get ChessDB Analysis
server.tool("get-chessdb-analysis", "Fetch position analysis and candidate moves from ChessDB", {
    fen: fenSchema,
}, async ({ fen }) => {
    const encodedFen = encodeURIComponent(fen);
    const apiUrl = `https://www.chessdb.cn/cdb.php?action=queryall&board=${encodedFen}&json=1`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        return {
            content: [
                {
                    type: "text",
                    text: `HTTP ${response.status}: Failed to fetch ChessDB data`,
                },
            ],
        };
    }
    const responseData = await response.json();
    if (responseData.status !== "ok") {
        return {
            content: [
                {
                    type: "text",
                    text: `Position evaluation not available: ${responseData.status}`,
                },
            ],
        };
    }
    const moves = responseData.moves;
    if (!Array.isArray(moves) || moves.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "No candidate moves found for this position.",
                },
            ],
        };
    }
    const processedMoves = moves.map((move) => {
        const scoreNum = Number(move.score);
        const scoreStr = isNaN(scoreNum) ? "N/A" : (scoreNum / 100).toFixed(2);
        return {
            uci: move.uci || "N/A",
            san: move.san || "N/A",
            score: scoreStr,
            winrate: move.winrate || "N/A",
            rank: move.rank,
            note: getChessDbNoteWord(move.note?.split(" ")[0] || ""),
        };
    });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    moves: processedMoves,
                    totalMoves: processedMoves.length
                }, null, 2),
            },
        ],
    };
});
// 10. Get Chess Knowledge Base
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
// 14. Render Chess Board
server.tool("generate-chess-board-view-artificat-using-html", "get HTML code to render chess board for given FEN, and use this code to generate an artificat", {
    fen: fenSchema,
    side: z.enum(["w", "b"]).optional().default("w").describe("Side to view the board from (white or black perspective). Note: Current implementation shows from white's perspective."),
}, async ({ fen, side = "w" }) => {
    try {
        // Extract just the position part if full FEN is provided
        const fullFen = fen.includes(' ') ? fen : `${fen} ${side} KQkq - 0 1`;
        const artifactHtml = viewBoardArtifact;
        return {
            content: [
                {
                    type: "text",
                    text: `Chess position rendered. FEN: ${fullFen}\n\nUse the artifact above to view the interactive chess board.`,
                },
                {
                    type: "resource",
                    resource: {
                        uri: `data:text/html;base64,${Buffer.from(artifactHtml).toString('base64')}`,
                        mimeType: "text/html",
                        text: artifactHtml
                    }
                }
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error rendering chess board: ${error}`,
                },
            ],
        };
    }
});
server.tool("generate-dynamic-gameview-html", "get HTML code to render chess board for a game with multiple fens to render game view mode", {}, async ({}) => {
    try {
        const artifactHtml = gameRenderHtml;
        return {
            content: [
                {
                    type: "text",
                    text: `Chess positions rendered. Use the artifact above to view the interactive chess board.`,
                },
                {
                    type: "resource",
                    resource: {
                        uri: `data:text/html;base64,${Buffer.from(artifactHtml).toString('base64')}`,
                        mimeType: "text/html",
                        text: artifactHtml
                    }
                }
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error rendering chess board: ${error}`,
                },
            ],
        };
    }
});
// 15. Fetch User Recent Games
server.tool("fetch-lichess-games", "Fetch the 20 most recent games for a Lichess user. Returns game details including player information, ratings, speed format, and PGN notation. Useful for analyzing a player's recent performance, openings, and game history.", {
    username: z.string().describe("Lichess username to fetch games for"),
}, async ({ username }) => {
    try {
        const response = await fetch(`https://lichess.org/api/games/user/${username}?until=${Date.now()}&max=20&pgnInJson=true&sort=dateDesc`, {
            method: "GET",
            headers: { accept: "application/x-ndjson" }
        });
        if (!response.ok) {
            if (response.status === 404) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `User "${username}" not found on Lichess.`,
                        },
                    ],
                };
            }
            throw new Error(`Failed to fetch games: ${response.statusText}`);
        }
        const rawData = await response.text();
        const games = rawData
            .split("\n")
            .filter(Boolean)
            .map((game) => JSON.parse(game));
        if (games.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No games found for user "${username}".`,
                    },
                ],
            };
        }
        // Format games for better readability
        const formattedGames = games.map((game, index) => {
            const white = game.players.white;
            const black = game.players.black;
            const date = new Date(game.lastMoveAt).toLocaleString();
            return `Game ${index + 1}:
- ID: ${game.id}
- Speed: ${game.speed}
- Date: ${date}
- White: ${white.user?.name || "Anonymous"} (${white.rating || "?"})
- Black: ${black.user?.name || "Anonymous"} (${black.rating || "?"})
- PGN available: Yes`;
        }).join("\n\n");
        return {
            content: [
                {
                    type: "text",
                    text: `Found ${games.length} recent games for "${username}":\n\n${formattedGames}\n\nRaw game data:`,
                },
                {
                    type: "text",
                    text: JSON.stringify(games, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching recent games: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
// 16. Fetch Lichess Game by URL or ID
server.tool("fetch-lichess-game", "Fetch a specific Lichess game in PGN format. Accepts either a full Lichess URL or a game ID. Returns the complete PGN notation with headers and moves, ready for analysis or display.", {
    gameUrlOrId: z.string().describe("Lichess game URL (e.g., https://lichess.org/abc12345) or game ID (e.g., abc12345)"),
}, async ({ gameUrlOrId }) => {
    try {
        // Extract game ID from URL or use as-is if already an ID
        let gameId = gameUrlOrId;
        // Check if it's a URL
        if (gameUrlOrId.includes("lichess.org") || gameUrlOrId.includes("/")) {
            try {
                const urlObj = new URL(gameUrlOrId);
                const pathname = urlObj.pathname;
                const gameIdMatch = pathname.match(/^\/([a-zA-Z0-9]{8,12})(?:\/|$)/);
                if (gameIdMatch) {
                    gameId = gameIdMatch[1];
                    if (gameId.length > 8) {
                        gameId = gameId.substring(0, 8);
                    }
                }
                else {
                    throw new Error("Could not extract game ID from URL");
                }
            }
            catch (urlError) {
                // Fallback: try parsing as path
                const parts = gameUrlOrId.split("/");
                if (parts.length >= 4) {
                    gameId = parts[3];
                    const cleanGameId = gameId.split(/[?#]/)[0];
                    gameId = cleanGameId.substring(0, 8);
                }
                else {
                    throw new Error("Invalid URL format");
                }
            }
        }
        if (!gameId || gameId.length < 8) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Invalid game ID extracted: "${gameId}". Please provide a valid Lichess game URL or 8-character game ID.`,
                    },
                ],
            };
        }
        // Fetch the game PGN
        const response = await fetch(`https://lichess.org/game/export/${gameId}`, {
            headers: {
                Accept: "application/x-chess-pgn",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch game: ${response.status} ${response.statusText}`);
        }
        const pgnText = await response.text();
        if (!pgnText || pgnText.trim() === "") {
            throw new Error("Empty PGN received from Lichess");
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully fetched game ${gameId}:\n\n${pgnText}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching Lichess game: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
// 15. Fetch Chess Puzzle
server.tool("fetch-chess-puzzle", "Fetch a random chess puzzle from Lichess database. Can filter by themes and rating range. Use this to start a puzzle session with the user.", {
    themes: z.array(z.string()).optional().describe("Array of puzzle theme tags to filter by (e.g., ['fork', 'pin', 'mateIn2'])"),
    ratingFrom: z.number().optional().describe("Minimum puzzle rating (e.g., 1000)"),
    ratingTo: z.number().optional().describe("Maximum puzzle rating (e.g., 2000)"),
}, async ({ themes, ratingFrom, ratingTo }) => {
    try {
        const puzzle = await fetchPuzzle({
            themes,
            ratingFrom,
            ratingTo,
        });
        if (!puzzle) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to fetch puzzle. Please try again.",
                    },
                ],
            };
        }
        // Parse the solution moves
        const solutionMoves = puzzle.moves.split(" ");
        const firstMove = puzzle.preMove; // The move that was just played
        // Determine whose turn it is from the FEN
        const turnToMove = puzzle.FEN.split(" ")[1] === "w" ? "White" : "Black";
        // Get theme descriptions
        const themeDescriptions = getThemeDescriptions(puzzle.themes);
        const difficultyLevel = getDifficultyLevel(puzzle.rating);
        const puzzleSession = {
            lichessId: puzzle.lichessId,
            rating: puzzle.rating,
            difficulty: difficultyLevel,
            themes: puzzle.themes,
            themeDescriptions: themeDescriptions,
            gameURL: puzzle.gameURL,
            // Position information
            previousFEN: puzzle.previousFEN,
            currentFEN: puzzle.FEN,
            turnToMove: turnToMove,
            // Move information
            opponentLastMove: firstMove,
            solution: solutionMoves,
            firstSolutionMove: solutionMoves[0],
            totalMoves: solutionMoves.length,
            // Instructions for Claude
            instructions: `A puzzle session has been started. The opponent just played ${firstMove}. It's ${turnToMove} to move. Guide the user through finding the best move without immediately revealing the answer. If they need help, provide hints about the tactical theme (${themeDescriptions.join(", ")}). The first move of the solution is ${solutionMoves[0]}.
        DO not show the themes to the user right away, hide the themes information from the start of the sesison, ONLY SHOW the themes when requested by user.`,
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(puzzleSession, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching puzzle: ${error}`,
                },
            ],
        };
    }
});
const PROMPT_CATEGORIES = {
    quickPosition: {
        name: "Quick Position Analysis",
        prompts: [
            "Analyze this position from White's perspective: {fen}. Give material, mobility, space, king safety, and a 1-2 move best plan.",
            "From Black's view in this FEN: {fen}. What are the top 3 candidate moves and why?",
            "Evaluate the following position for White and propose a concrete improvement in 3 moves: {fen}."
        ]
    },
    themeScores: {
        name: "Theme-Focused Scores",
        prompts: [
            "Compute theme scores (material, mobility, space, positional, king safety) for this position: {fen}, color {color}.",
            "Track how material and king safety change over the next 5 moves in this variation: {fen}, moves: {moves}.",
            "For the move sequence {moves}, show the progression of the theme '{theme}' from {color}'s perspective."
        ]
    },
    variationExploration: {
        name: "Variation Exploration",
        prompts: [
            "From this root position {fen}, compare two lines: Line A {lineA}, Line B {lineB}. Which line maintains better space and king safety for {color}?",
            "Evaluate three candidate continuations after this move: {fen} … {move}. Provide a side-by-side theme analysis.",
            "Analyze a set of 2-3 variations from this root position and summarize which has the strongest material balance and initiative."
        ]
    },
    stockfishAnalysis: {
        name: "Stockfish Deep Dive",
        prompts: [
            "Provide a Stockfish-based best move and the rationale for this position: {fen}, depth {depth}.",
            "After {opening}, analyze the position with best move, key plans, and a short variation for both sides.",
            "Given this position: {fen}, show a candidate move, a main line, and an alternative line with evaluation at depth {depth}."
        ]
    },
    criticalMoments: {
        name: "Critical Moments",
        prompts: [
            "Identify the critical moments in this sequence: {moves}. Highlight where the material or king safety theme shifts significantly.",
            "Find the first moment in this line where {color}'s king safety worsens and suggest improvements for {opponent}: {fen}, moves: {moves}.",
            "List any moves in this variation that flip the evaluation by more than 0.5 pawns in favor of {color}."
        ]
    },
    learning: {
        name: "Learning & Training",
        prompts: [
            "Explain the key imbalances in this position and how to exploit them as {color}: {fen}.",
            "Create a 5-question drill from this position focusing on pawn structure and piece activity: {fen}.",
            "Provide a short, practical plan for {color} to convert a small material edge in this position: {fen}."
        ]
    },
    opening: {
        name: "Opening Repertoire",
        prompts: [
            "From this opening position, what are common middlegame plans for {color}, and how do you adapt if {opponent} plays {reply}?",
            "Generate a mini-repertoire for {color} against {opening} based on this transposition: {fen} with {color} to move.",
            "Summarize typical themes for {color} in this structure and suggest how {opponent} should respond."
        ]
    },
    visualization: {
        name: "Visualization",
        prompts: [
            "Render the board for this FEN and annotate the best move visually: {fen}, best move: {move}.",
            "Provide a move-by-move text walk-through of this variation with brief explanations for each ply: {fen}, moves: {moves}."
        ]
    },
    puzzles: {
        name: "Puzzles & Practice",
        prompts: [
            "Generate a tactical puzzle from this position with {color} to move that requires a forcing line to advantage: {fen}.",
            "Provide a mate-in-{n} puzzle derived from this position: {fen}, {color} to move.",
            "Give me three training prompts: 'find the best plan', 'spot the tactical shot', 'improve piece activity' using this position: {fen}."
        ]
    },
    custom: {
        name: "Custom Analysis",
        prompts: [
            "Explain the key priorities for {color} in a +/- balance equal position with this FEN: {fen}.",
            "Describe how to transition from this middlegame to an endgame favorable to {color}, given this structure: {fen}.",
            "If I want to practice endgames, give me a pared-down line from this position that leads to a rook ending."
        ]
    }
};
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
// 16. Get Available Puzzle Themes
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
server.tool("generate-game-review", "Generate a comprehensive game review with theme progression analysis from a PGN. Analyzes material, mobility, space, positional play, and king safety for both players throughout the game.", {
    pgn: z.string().describe("Game PGN with moves and optional headers"),
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
        // Text format - human readable
        const formattedReview = formatGameReview(review);
        // Also include detailed theme changes
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
        // Add critical moments details
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
server.tool("parse-pgn-into-fens", "Collect a fen list of given game pgn", {
    pgn: z.string().describe("Game PGN"),
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
// prompts
server.registerPrompt("analyze-position", {
    title: "Analyze Chess Position",
    description: "Analyze a chess position comprehensively using chess principles",
    argsSchema: {
        fen: fenSchema,
        side: z.string().optional().describe("Side to analyze from (white/black)")
    }
}, ({ fen, side = "white" }) => ({
    messages: [{
            role: "user",
            content: {
                type: "text",
                text: `You are a chess master analyzing this position from ${side}'s perspective.

FEN: ${fen}

Please provide a comprehensive analysis covering:

1. **Material Count**: Compare material for both sides
2. **King Safety**: Evaluate king positions and potential threats
3. **Piece Activity**: Assess how well pieces are placed
4. **Pawn Structure**: Analyze pawn chains, weaknesses, and strengths
5. **Control of Key Squares**: Important central and strategic squares
6. **Tactical Opportunities**: Look for pins, forks, skewers, discovered attacks
7. **Strategic Plans**: Suggest concrete plans for both sides

Use chess notation and be specific about piece placements and tactical motifs. Conclude with an evaluation (advantage to white/black/equal) and recommend the best continuation.`
            }
        }]
}));
server.registerPrompt("ChessAgine Mode", {
    title: "Make Claude behave like chessagine",
    description: "Use Chess Agent + Engine system prompt to make Claude a better chess helper",
}, () => ({
    messages: [{
            role: "user",
            content: {
                type: "text",
                text: `${agineSystemPrompt}`
            }
        }]
}));
server.registerPrompt("Become-ChessAgine-Chess-Annotation-Expert", {
    title: "Make Claude behave like chessagine annotation expert",
    description: "Use Chess Agent + Engine annotation system prompt to make Claude a better chess writing",
}, () => ({
    messages: [{
            role: "user",
            content: {
                type: "text",
                text: `${chessAgineAnnoPrompt}`
            }
        }]
}));
server.registerPrompt("Design-ChessDashboards", {
    title: "Use chessdashboard UI design guide to create dashboards for user",
    description: "Use chessdashboard UI design guide to create dashboards for user",
}, () => ({
    messages: [{
            role: "user",
            content: {
                type: "text",
                text: `${agineDesigner}`
            }
        }]
}));
// Main function to run the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ChessAgine MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
