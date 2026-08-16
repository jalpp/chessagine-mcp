import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import {
  fenSchema,
  gamePgnSchema,
  is960Schema,
  moveAlgSchema,
  sideSchema,
  themesTypeSchema,
  variationSchema,
} from "../runner/schema.js";
import z from "zod";
import { RemoteHttpToolConfig } from "../mcp/remote/remoteHttpToolAdapter.js";

export class ThemeApiContract extends API implements APIContract {
  constructor() {
    super("THEME_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    return [];
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const contracts: PostToolAdapterConfig<{}>[] = [
      {
        name: "get-theme-scores",
        endpoint: `${BASE_URL}/scores`,
        description:
          "Get chess theme eval scores (material, mobility, space, positional, king safety, tactics, dark/light sqaure control) for a given position fen and the side to eval from. Positive eval means white is better, negative means black is better, Zero is equal",
        inputSchema: { fen: fenSchema, color: sideSchema, is960: is960Schema },
      },
      {
        name: "get-tactical-position-summary",
        endpoint: `${BASE_URL}/tactical-summary`,
        description:
          "Get tactical position summary like hanging pieces, semi protected pieces, forks, pins for the given fen",
        inputSchema: { fen: fenSchema, is960: is960Schema },
      },
      {
        name: "analyze-variation-themes",
        endpoint: `${BASE_URL}/variation-analysis`,
        description:
          "Analyze how chess themes change across a sequence of moves",
        inputSchema: {
          rootFen: fenSchema,
          moves: moveAlgSchema,
          color: sideSchema,
          is960: is960Schema,
        },
      },
      {
        name: "get-theme-progression",
        endpoint: `${BASE_URL}/progression`,
        description:
          "Get the progression of a specific chess theme over a variation",
        inputSchema: {
          rootFen: fenSchema,
          moves: moveAlgSchema,
          color: sideSchema,
          theme: themesTypeSchema,
          is960: is960Schema,
        },
      },
      {
        name: "compare-variations",
        endpoint: `${BASE_URL}/compare-variations`,
        description:
          "Compare multiple chess variations and return their theme analyses",
        inputSchema: {
          rootFen: fenSchema,
          variations: variationSchema,
          color: sideSchema,
          is960: is960Schema,
        },
      },
      {
        name: "find-critical-moments",
        endpoint: `${BASE_URL}/critical-moments`,
        description:
          "Find moves in a chess variation where there are significant theme changes",
        inputSchema: {
          rootFen: fenSchema,
          moves: moveAlgSchema,
          color: sideSchema,
          threshold: z
            .number()
            .optional()
            .default(0.5)
            .describe("Threshold for significant changes"),
          is960: is960Schema,
        },
      },
      {
        name: "generate-game-review",
        endpoint: `${BASE_URL}/game-review`,
        description:
          "Generate a comprehensive game review with theme progression analysis from a PGN. Analyzes material, mobility, space, positional play, and king safety for both players throughout the game.",
        inputSchema: {
          pgn: gamePgnSchema,
          criticalMomentThreshold: z
            .number()
            .min(0.1)
            .max(2.0)
            .default(0.5)
            .optional()
            .describe(
              "Threshold for identifying critical moments (default: 0.5). Lower values find more moments.",
            ),
          format: z
            .enum(["json", "text"])
            .default("text")
            .optional()
            .describe(
              "Output format: 'json' for structured data or 'text' for human-readable report",
            ),
          is960: is960Schema,
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
