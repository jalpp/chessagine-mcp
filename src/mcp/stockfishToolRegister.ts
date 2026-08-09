import { McpServer } from "@modelcontextprotocol/server";
import { fenSchema, engineDepthSchema } from "../runner/schema.js";
import { z } from "zod";
import { postToolAdapter } from "@jalpp/mcp-adapter";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../services/config.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.SF_BASE_URL;

export function registerStockfishTools(server: McpServer): void {

  postToolAdapter(server, {
    name: "get-stockfish-analysis",
    description: "Analyze a chess position using Stockfish 18 Multi-threated Lite WASM engine",
    endpoint: `${BASE_URL}/evaluate`,
    inputSchema: {
      fen: fenSchema,
      depth: engineDepthSchema,
      nullMove: z.boolean().describe("Set to true to apply null move to check opposite side's evaluation"),
      multiPv: z.number().min(1).max(5).default(1).optional().describe("Number of principal variations"),
    },
  });

  postToolAdapter(server, {
    name: "fen-openingbook-lookup",
    description: "Look up a fen in 12k positions of opening book to get name, moves information for fen",
    endpoint: `${BASE_URL}/book`,
    inputSchema: {
      fen: fenSchema,
    },
  });

  postToolAdapter(server, {
    name: "get-stockfish-best-move",
    description: "Find the best move in a chess position using Stockfish 18 Multi-threated Lite WASM engine",
    endpoint: `${BASE_URL}/bestmove`,
    inputSchema: {
      fen: fenSchema,
      nullMove: z.boolean().describe("Set to true to apply null move to check opposite side's evaluation"),
      depth: engineDepthSchema,
    },
  });

  postToolAdapter(server, {
    name: "get-stockfish-multipv-analysis",
    description: "Analyze a chess position and get multiple best move candidates with Stockfish 18 Multi-threated Lite WASM engine",
    endpoint: `${BASE_URL}/evaluate`,
    inputSchema: {
      fen: fenSchema,
      depth: engineDepthSchema,
      nullMove: z.boolean().describe("Set to true to apply null move to check opposite side's evaluation"),
      multiPv: z.number().min(1).max(5).describe("Number of best move lines to analyze (1-5)"),
    },
  });

  postToolAdapter(server, {
    name: "get-stockfish-batch-analysis",
    description: "Analyze multiple chess positions in batch using Stockfish 18 Multi-threated Lite WASM engine",
    endpoint: `${BASE_URL}/analyze-batch`,
    inputSchema: {
      positions: z.array(z.object({ fen: fenSchema })).describe("Array of positions to analyze"),
    },
  });
}