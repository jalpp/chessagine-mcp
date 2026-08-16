import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import {
  gamePgnSchema,
  is960Schema,
} from "../runner/schema.js";
import z from "zod";
import { RemoteHttpToolConfig } from "../mcp/remote/remoteHttpToolAdapter.js";

export class UtilEngineContract extends API implements APIContract {
  constructor() {
    super("UTIL_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    return [];
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const contracts: PostToolAdapterConfig<{}>[] = [
      {
        name: "get-chess-knowledge",
        description: "Get the curated chess knowledge base as a JSON object.",
        endpoint: `${BASE_URL}/knowledge-base`,
        inputSchema: {},
      },
      {
        name: "get-puzzle-themes",
        description:
          "Get a list of all available puzzle themes that can be used to filter puzzles",
        endpoint: `${BASE_URL}/puzzle-themes`,
        inputSchema: {},
      },
      {
        name: "parse-pgn-into-move-fens",
        description:
          "Parses a PGN into a move list object containing move information like before, after FEN, move notation, and move numbers",
        endpoint: `${BASE_URL}/parse-pgn-into-fens`,
        inputSchema: { pgn: gamePgnSchema, is960: is960Schema },
      },
      {
        name: "get-fen-map-lookup",
        description: "Lookup fens for mapped SAN move, for given game PGN",
        endpoint: `${BASE_URL}/fen-map-lookup`,
        inputSchema: {
          pgn: gamePgnSchema,
          isAfter: z
            .boolean()
            .describe(
              "If true, maps moves to FEN after the move; if false, maps to FEN before the move",
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
}
