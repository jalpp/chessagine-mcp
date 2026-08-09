import { McpServer } from "@modelcontextprotocol/server";
import z from "zod";
import { fenSchema} from "../runner/schema.js";
import { postToolAdapter } from "@jalpp/mcp-adapter";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../services/config.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.NN_BASE_URL;

export function registerNeuralNetTools(server: McpServer): void {
  postToolAdapter(server, {
    name: "get-maia3-analysis",
    description:
      "Analyze chess position using Maia3 neural network trained on human games at specific rating levels. Provides human-like move suggestions and evaluations, and estimated human eval HEE, tailored to player strength (600-2600 rating).",
    endpoint: `${BASE_URL}`,
    inputSchema: {
      endpoint: z.literal("analyze").default("analyze"),
      fen: fenSchema,
      engine: z.literal("maia3").default("maia3"),
      rating: z
        .number()
        .min(600)
        .max(2600)
        .describe(
          "Target player rating level for analysis, the rating must be the following values: [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600]",
        ),
    },
  });
  
  postToolAdapter(server, {
    name: "get-leela-analysis",
    description:
      "Analyze chess position using Leela Chess Zero neural network. Provides strong tactical analysis with neural network evaluation and candidate moves, and estimated converted stockfish like centi-pawn eval. Uses T1-256x10 neural net, trained on self played games",
    endpoint: `${BASE_URL}`,
    inputSchema: {
      endpoint: z.literal("analyze").default("analyze"),
      fen: fenSchema,
      engine: z.literal("leela").default("leela"),
    },
  });

  postToolAdapter(server, {
    name: "get-maia3-batch-analysis",
    description:
      "Analyze chess position using Maia3 neural network across all rating levels (600-2600). Returns analyses for all 21 Maia3 rating models in a single batch request.",
    endpoint: `${BASE_URL}`,
    inputSchema: {
      endpoint: z.literal("batch-maia3").default("batch-maia3"),
      fen: fenSchema,
    },
  });

  postToolAdapter(server, {
    name: "get-elite-leela-analysis",
    description:
      "Analyze chess position using Elite Leela Chess Zero with enhanced evaluation. Provides top-level computer analysis with deep neural network insights likeevaluation and candidate moves, and estimated converted stockfish like centi-pawn eval. Trained on 20M games from Lichess Elite Database (2500 - 3000)",
    endpoint: `${BASE_URL}`,
    inputSchema: {
      endpoint: z.literal("analyze").default("analyze"),
      fen: fenSchema,
      engine: z.literal("elite-leela").default("elite-leela"),
    },
  });
}
