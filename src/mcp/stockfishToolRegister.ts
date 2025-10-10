import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fenSchema, engineDepthSchema, moveSchema } from "../runner/schema.js";
import { calculateDeep } from "../themes/state.js";
import { getChessEvaluation, generateChessAnalysis } from "../tools/fish.js";
import { getChessDbNoteWord, validateEngineDepth } from "../utils/utils.js";

export function registerStockfishTools(server: McpServer): void {
    server.tool(
      "get-stockfish-analysis",
      "Analyze a given chess position using Stockfish and provide best move, reasoning, and variation, speech Eval and number Eval",
      {
        fen: fenSchema,
        depth: engineDepthSchema,
      },
      async ({ fen, depth }) => {
        try {
          const validDepth = validateEngineDepth(depth);
          const evaluation = await getChessEvaluation(fen, validDepth);
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
    
    
    
    
    server.tool(
      "get-stockfish-move-analysis",
      "Analyze a given chess position after a specific move using Stockfish and provide best move, reasoning, variation, speech eval, and number eval",
      {
        fen: fenSchema,
        move: moveSchema,
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
    
    
    
}