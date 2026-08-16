import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import { engineDepthSchema, fenSchema } from "../runner/schema.js";
import z from "zod";
import { RemoteHttpToolConfig } from "../mcp/remote/remoteHttpToolAdapter.js";

export class StockfishApiContract extends API implements APIContract {
  constructor() {
    super("SF_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    return [];
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const contracts: PostToolAdapterConfig<{}>[] = [
      {
        name: "get-stockfish-analysis",
        description:
          "Analyze a chess position using Stockfish 18 Multi-threated Lite WASM engine",
        endpoint: `${BASE_URL}/evaluate`,
        inputSchema: {
          fen: fenSchema,
          depth: engineDepthSchema,
          nullMove: z
            .boolean()
            .describe(
              "Set to true to apply null move to check opposite side's evaluation",
            ),
          multiPv: z
            .number()
            .min(1)
            .max(5)
            .default(1)
            .optional()
            .describe("Number of principal variations"),
        },
      },
      {
        name: "fen-openingbook-lookup",
        description:
          "Look up a fen in 12k positions of opening book to get name, moves information for fen",
        endpoint: `${BASE_URL}/book`,
        inputSchema: {
          fen: fenSchema,
        },
      },
      {
        name: "get-stockfish-best-move",
        description:
          "Find the best move in a chess position using Stockfish 18 Multi-threated Lite WASM engine",
        endpoint: `${BASE_URL}/bestmove`,
        inputSchema: {
          fen: fenSchema,
          nullMove: z
            .boolean()
            .describe(
              "Set to true to apply null move to check opposite side's evaluation",
            ),
          depth: engineDepthSchema,
        },
      },
      {
        name: "get-stockfish-multipv-analysis",
        description:
          "Analyze a chess position and get multiple best move candidates with Stockfish 18 Multi-threated Lite WASM engine",
        endpoint: `${BASE_URL}/evaluate`,
        inputSchema: {
          fen: fenSchema,
          depth: engineDepthSchema,
          nullMove: z
            .boolean()
            .describe(
              "Set to true to apply null move to check opposite side's evaluation",
            ),
          multiPv: z
            .number()
            .min(1)
            .max(5)
            .describe("Number of best move lines to analyze (1-5)"),
        },
      },
      {
        name: "get-stockfish-batch-analysis",
        description:
          "Analyze multiple chess positions in batch using Stockfish 18 Multi-threated Lite WASM engine",
        endpoint: `${BASE_URL}/analyze-batch`,
        inputSchema: {
          positions: z
            .array(z.object({ fen: fenSchema }))
            .describe("Array of positions to analyze"),
        },
      },
      {
        name: "get-chessdb-expand-queue",
        description:
          "Expand a ChessDB position tree using breadth-first search and queue up to 20 positions via tree search",
        endpoint: `${BASE_URL}/expandqueue`,
        inputSchema: {
          fen: fenSchema,
          expansionDepth: z
            .number()
            .min(1)
            .max(10)
            .describe("BFS plies from root (max 10, default 4)"),
          expansionWidth: z
            .number()
            .min(1)
            .max(5)
            .describe("Branches followed per interior node (max 5, default 2)"),
          maxPositionsQueued: z
            .number()
            .min(1)
            .max(20)
            .describe("Hard cap on ChessDB queue calls (max 20, default 20)"),
        },
      },
    ];

    return contracts;
  }

  deleteContracts(): DeleteToolAdapterConfig<{}>[] {
    return [];
  }

  getMethodRemoteContracts(): RemoteHttpToolConfig<{}>[] {
      return [];
  }

  isRemoteEnvContract(): boolean {
    return this.getRemoteHeaderSupported();
  }
}
