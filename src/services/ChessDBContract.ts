import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import { fenSchema } from "../runner/schema.js";
import { SERVICE_CONFIG_BASE_URL_MAP } from "./config.js";

export class ChessDbApiContract extends API implements APIContract {
  constructor() {
    super("CHESSDB_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP["CHESSDB_BASE_URL"];

    const contracts: GetToolAdapterConfig<{}>[] = [
      {
        name: "get-chessdb-analysis",
        description: "Fetch position analysis and candidate moves from ChessDB",
        endpoint: `${BASE_URL}?action=queryall&board=:fen&json=1`,
        inputSchema: { fen: fenSchema },
      },
      {
        name: "get-chessdb-pv",
        description:
          "Fetch the principal variation (best line) for a position from ChessDB",
        endpoint: `${BASE_URL}?action=querypv&board=:fen&stable=1&json=1`,
        inputSchema: { fen: fenSchema },
      },
      {
        name: "queue-chessdb-analysis",
        description:
          "Queue a single chess position for background analysis on ChessDB",
        endpoint: `${BASE_URL}?action=queue&board=:fen&json=1`,
        inputSchema: { fen: fenSchema },
      },
    ];

    return contracts;
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    return [];
  }

  deleteContracts(): DeleteToolAdapterConfig<{}>[] {
    return [];
  }
}
