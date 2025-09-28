#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getOpeningStatSpeech, getLichessOpeningStats, getOpeningStats } from "./opening.js";
import { calculateDeep, getBoardState } from "./state.js"
import { generateChessAnalysis, getChessEvaluation } from "./fish.js";
import { getKnowledgeBase } from "./knowlegebase.js";
import {
  getThemeProgression,
  getThemeScores,
  analyzeVariationThemes,
  findCriticalMoments,
  compareVariations,
} from "./ovp.js";
import { Color } from "chess.js";
import { PositionPrompter } from "./positionPrompter.js";
import { agineSystemPrompt, chessAgineAnnoPrompt } from "./prompt.js";

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
  .regex(
    /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [bw] [KQkq-]+ [a-h][1-8]|[a-h][1-8]|[a-h][1-8]|[a-h][1-8]|- \d+ \d+$/,
    "Invalid FEN format"
  ).describe("FEN string representing the board position");

const moveSchema = z
  .string()
  .min(2)
  .max(7)
  .describe("Algebraic chess move like 'e4', 'Nf3', 'O-O'");

const colorSchema = z.enum(["w", "b"]).describe("Side to evaluate from");

// Register tools

// 1. Get Theme Scores
server.tool(
  "get-theme-scores",
  "Get chess theme scores (material, mobility, space, positional, king safety) for a given position fen and the side to eval from",
  {
    fen: fenSchema,
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
  },
  async ({ fen, color }) => {
    try {
      const result = getThemeScores(fen, color as Color);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting theme scores:`,
          },
        ],
      };
    }
  }
);

// 2. Analyze Variation Themes
server.tool(
  "analyze-variation-themes",
  "Analyze how chess themes change across a sequence of moves",
  {
    rootFen: fenSchema,
    moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
  },
  async ({ rootFen, moves, color }) => {
    try {
      const result = analyzeVariationThemes(rootFen, moves, color as Color);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing variation themes:`,
          },
        ],
      };
    }
  }
);

// 3. Get Theme Progression
server.tool(
  "get-theme-progression",
  "Get the progression of a specific chess theme over a variation",
  {
    rootFen: fenSchema,
    moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
    theme: z.enum([
      "material",
      "mobility", 
      "space",
      "positional",
      "kingSafety",
    ]).describe("Theme to track"),
  },
  async ({ rootFen, moves, color, theme }) => {
    try {
      const result = getThemeProgression(rootFen, moves, color as Color, theme);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting theme progression:`,
          },
        ],
      };
    }
  }
);

// 4. Compare Variations
server.tool(
  "compare-variations",
  "Compare multiple chess variations and return their theme analyses",
  {
    rootFen: fenSchema,
    variations: z.array(
      z.object({
        name: z.string(),
        moves: z.array(z.string()),
      })
    ).describe("Array of variations to compare"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
  },
  async ({ rootFen, variations, color }) => {
    try {
      const result = compareVariations(rootFen, variations, color as Color);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error comparing variations`,
          },
        ],
      };
    }
  }
);

// 5. Find Critical Moments
server.tool(
  "find-critical-moments",
  "Find moves in a chess variation where there are significant theme changes",
  {
    rootFen: fenSchema,
    moves: z.array(z.string()).describe("Array of moves in algebraic notation"),
    color: z.enum(["w", "b"]).describe("Side to evaluate from"),
    threshold: z.number().optional().default(0.5).describe("Threshold for significant changes"),
  },
  async ({ rootFen, moves, color, threshold = 0.5 }) => {
    try {
      const result = findCriticalMoments(rootFen, moves, color as Color, threshold);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error finding critical moments:`,
          },
        ],
      };
    }
  }
);

// 6. Get Stockfish Analysis
server.tool(
  "get-stockfish-analysis",
  "Analyze a given chess position using Stockfish and provide best move, reasoning, and variation, speech Eval and number Eval",
  {
    fen: fenSchema,
    depth: z.number().min(12).max(15).describe("Search depth for Stockfish engine"),
  },
  async ({ fen, depth }) => {
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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting Stockfish analysis:`,
          },
        ],
      };
    }
  }
);

// 7. Get Stockfish Move Analysis
server.tool(
  "get-stockfish-move-analysis",
  "Analyze a given chess position after a specific move using Stockfish and provide best move, reasoning, variation, speech eval, and number eval",
  {
    fen: fenSchema,
    move: z.string().describe("The move to be played in UCI or SAN format"),
  },
  async ({ fen, move }) => {
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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting Stockfish move analysis:`,
          },
        ],
      };
    }
  }
);

// 8. Is Legal Move
server.tool(
  "is-legal-move",
  "Check if a given move is legal for the provided FEN position",
  {
    fen: z.string().describe("FEN string representing the board position, the fen must be in full form containing which side to move"),
    move: z.string().describe("Move to check (in SAN or UCI format)"),
  },
  async ({ fen, move }) => {
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
      const isLegal =
        legalMoves.includes(moveToCheck) ||
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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ isLegal: false, message: "Error checking move legality." }, null, 2),
          },
        ],
      };
    }
  }
);

// 9. Board State to Prompt
server.tool(
  "boardstate-to-prompt",
  "Given a FEN and a move, returns a string describing the resulting board state after the move",
  {
    fen: fenSchema,
    move: z.string().describe("The move to be played (in SAN or UCI format)"),
  },
  async ({ fen, move }) => {
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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating board state prompt:`,
          },
        ],
      };
    }
  }
);

// 11. Get Lichess Master Games
server.tool(
  "get-lichess-master-games",
  "Fetch master-level games and opening statistics from Lichess for a given position",
  {
    fen: fenSchema,
  },
  async ({ fen }) => {
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
  }
);

// 12. Get Lichess Games
server.tool(
  "get-lichess-games", 
  "Fetch Lichess user games and opening statistics for a given position",
  {
    fen: fenSchema,
  },
  async ({ fen }) => {
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
  }
);

function getChessDbNoteWord(note: string): string {
  switch(note){
    case "!":
      return "Best";
    case "*": 
      return "Good";
    case "?": 
      return "Bad"; 
    default:
      return "unknown";     
  }
}

// 13. Get ChessDB Analysis
server.tool(
  "get-chessdb-analysis",
  "Fetch position analysis and candidate moves from ChessDB",
  {
    fen: fenSchema,
  },
  async ({ fen }) => {
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
    
    const processedMoves = moves.map((move: any) => {
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
  }
);



// 10. Get Chess Knowledge Base
server.tool(
  "get-chess-knowledgebase",
  "Returns a comprehensive chess knowledgebase including Silman Imbalances, Fine's 30 chess principles, endgame principles, and practical checklists",
  {},
  async () => {
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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting chess knowledge base:`,
          },
        ],
      };
    }
  }
);


// prompts

server.registerPrompt(
  "analyze-position",
  {
    title: "Analyze Chess Position",
    description: "Analyze a chess position comprehensively using chess principles",
    argsSchema: {
      fen: fenSchema,
      side: z.string().optional().describe("Side to analyze from (white/black)")
    }
  },
  ({ fen, side = "white" }) => ({
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
  })
);

server.registerPrompt(
  "ChessAgine Mode",
  {
    title: "Make Claude behave like chessagine",
    description: "Use Chess Agent + Engine system prompt to make Claude a better chess helper",
    
  },
  () => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `${agineSystemPrompt}`
      }
    }]
  })
);

server.registerPrompt(
  "Become-ChessAgine-Chess-Annotation-Expert",
  {
    title: "Make Claude behave like chessagine annotation expert",
    description: "Use Chess Agent + Engine annotation system prompt to make Claude a better chess writing",
    
  },
  () => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `${chessAgineAnnoPrompt}`
      }
    }]
  })
);

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
