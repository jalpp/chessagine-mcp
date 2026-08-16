import z from "zod";
import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import {
  RemoteHttpMethod,
  RemoteHttpToolConfig,
} from "../mcp/remote/remoteHttpToolAdapter.js";
import { RemoteCredentials } from "../mcp/remote/remoteAuth.js";

export class PosiraApiContract extends API implements APIContract {
  constructor() {
    super("POSIRA_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const staticAuth = factory.staticAuth;

    const contracts: GetToolAdapterConfig<{}>[] = [
      {
        name: "get-posira-explorer",
        description:
          "Look up opening statistics for a given chess position. Returns the most common next moves with game counts and win/draw/loss percentages, derived from 7.5 billion Lichess games. Able to filter by ratings, title, and speeds",
        endpoint: `${BASE_URL}/api/v1/explorer`,
        inputSchema: {
          moves: z
            .string()
            .optional()
            .describe(
              "Comma-separated SAN moves from the starting position, e.g. 'e4,c5,Nf3'. Required if fen is not provided.",
            ),
          fen: z
            .string()
            .optional()
            .describe(
              "FEN string of the position to query. Alternative to moves. Required if moves is not provided.",
            ),
          top_n: z
            .number()
            .min(1)
            .max(50)
            .optional()
            .describe(
              "Maximum number of moves to return. Default: 12, max: 50.",
            ),
          speeds: z
            .string()
            .optional()
            .describe(
              "Comma-separated speed filters: ultrabulllet, bullet, blitz, rapid, classical, correspondence. e.g. 'blitz,rapid'",
            ),
          ratings: z
            .string()
            .optional()
            .describe(
              "Comma-separated Elo bracket filters: 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500. e.g. '1800,2000,2200'",
            ),
          titled: z
            .boolean()
            .optional()
            .describe("Filter to titled players only (GM, IM, FM, etc.)"),
        },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-posira-health",
        description:
          "Check Posira API status and database statistics including total games indexed and unique positions.",
        endpoint: `${BASE_URL}/api/v1/health`,
        inputSchema: {},
        tokenParam: "token",
        auth: staticAuth,
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

  getMethodRemoteContracts(): RemoteHttpToolConfig<{}>[] {
    const localContracts = this.getContracts();
    const remoteContracts: RemoteHttpToolConfig<{}>[] = [];

    for (let i = 0; i < localContracts.length; i++) {
      if (localContracts[i].tokenParam === "token") {
        const remoteContract = {
          ...localContracts[i],
          method: "GET" as RemoteHttpMethod,
          headerCredKey: this.getAuthServiceConfig()
            .headerKey as keyof RemoteCredentials,
        };
        remoteContracts.push(remoteContract);
      }
    }

    return remoteContracts;
  }

  isRemoteEnvContract(): boolean {
    return this.getRemoteHeaderSupported();
  }
}
