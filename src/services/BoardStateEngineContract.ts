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
  moveSchema,
  movesListSchema,
} from "../runner/schema.js";
import { RemoteHttpToolConfig } from "../mcp/remote/remoteHttpToolAdapter.js";


export class BoardStateEngineContract extends API implements APIContract {
  constructor() {
    super("BOARD_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    return [];
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const contracts: PostToolAdapterConfig<{}>[] = [
      {
        name: "is-legal-move",
        description:
          "Check if a given move is legal for the provided FEN position",
        endpoint: `${BASE_URL}/check-legal-move`,
        inputSchema: {
          fen: fenSchema,
          move: moveSchema,
          is960: is960Schema,
        },
      },
      {
        name: "get-boardstate-for-move",
        endpoint: `${BASE_URL}/state-for-move`,
        description:
          "Given a FEN and a move, returns a string describing the resulting board state after the move",
        inputSchema: {
          fen: fenSchema,
          move: moveSchema,
          is960: is960Schema,
        },
      },
      {
        name: "parse-moves-for-boardstate",
        endpoint: `${BASE_URL}/ending-state`,
        description:
          "Given a FEN, and list of moves played from FEN, parses and returns the ending board state",
        inputSchema: {
          fen: fenSchema,
          moves: movesListSchema,
          is960: is960Schema,
        },
      },
      {
        name: "get-boardstate-for-fen",
        endpoint: `${BASE_URL}/state-for-fen`,
        description:
          "Given a FEN, returns a string describing the resulting board state for that FEN",
        inputSchema: {
          fen: fenSchema,
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
