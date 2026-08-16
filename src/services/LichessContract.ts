import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import {
  fenSchema,
  puzzleThemesArraySchema,
  tokenSchema,
} from "../runner/schema.js";
import z from "zod";
import { SERVICE_CONFIG_BASE_URL_MAP } from "./config.js";
import {
  RemoteHttpMethod,
  RemoteHttpToolConfig,
} from "../mcp/remote/remoteHttpToolAdapter.js";
import { RemoteCredentials } from "../mcp/remote/remoteAuth.js";
import { setRemoteContract } from "../mcp/remote/createRemoteContract.js";

export class LichessContract extends API implements APIContract {
  constructor() {
    super("LICHESS_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const staticLichessAuth = factory.staticAuth;

    const contracts: GetToolAdapterConfig<{}>[] = [
      {
        name: "get-lichess-master-games",
        description:
          "Fetch master-level games and opening statistics from Lichess for a given position",
        endpoint:
          "https://explorer.lichess.org/masters?fen=:fen&moves=12&topGames=15",
        inputSchema: { fen: fenSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticLichessAuth,
      },
      {
        name: "get-lichess-games",
        description:
          "Fetch Lichess user games and opening statistics for a given position",
        endpoint:
          "https://explorer.lichess.org/lichess?fen=:fen&moves=12&topGames=4",
        inputSchema: { fen: fenSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticLichessAuth,
      },
      {
        name: "fetch-lichess-games",
        description:
          "Fetch recent games for a Lichess user in a simple text-friendly format.",
        endpoint:
          "https://lichess.org/api/games/user/:username?max=20&pgnInJson=true&sort=dateDesc",
        inputSchema: {
          username: z.string().describe("Lichess username to fetch games for"),
          token: tokenSchema,
        },
        tokenParam: "token",
        auth: staticLichessAuth,
      },
      {
        name: "fetch-lichess-game",
        description: "Fetch a specific Lichess game in PGN format by game ID.",
        endpoint: "https://lichess.org/game/export/:gameId",
        inputSchema: {
          gameId: z.string().describe("Lichess game ID (for example abc12345)"),
        },
      },
      {
        name: "fetch-lichess-studies",
        description:
          "Fetch all studies for a given Lichess user. Returns a list of studies with their IDs, names, and timestamps.",
        endpoint: "https://lichess.org/api/study/by/:username",
        inputSchema: {
          username: z
            .string()
            .describe("Lichess username to fetch studies for"),
          token: tokenSchema,
        },
        tokenParam: "token",
        auth: staticLichessAuth,
      },
      {
        name: "fetch-lichess-study-pgn",
        description:
          "Fetch a specific Lichess study in PGN format. Returns all chapters of the study as PGN.",
        endpoint: "https://lichess.org/api/study/:studyId.pgn",
        inputSchema: {
          studyId: z
            .string()
            .describe("Lichess study ID (for example WTvnkWAL)"),
          token: tokenSchema,
        },
        tokenParam: "token",
        auth: staticLichessAuth,
      },
    ];

    return contracts;
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    const contracts: PostToolAdapterConfig<{}>[] = [
      {
        name: "fetch-chess-puzzle",
        description:
          "Fetch a random chess puzzle from the Lichess-backed puzzle service. Can filter by themes and rating range. Use this to start a puzzle session with the user.",
        endpoint: `${SERVICE_CONFIG_BASE_URL_MAP.SF_BASE_URL}/puzzle/builder`,
        inputSchema: {
          themes: puzzleThemesArraySchema,
          ratingFrom: z
            .number()
            .min(1000)
            .describe("Minimum puzzle rating (e.g., 1000)"),
          ratingTo: z
            .number()
            .max(2500)
            .describe("Maximum puzzle rating (e.g., 2000)"),
        },
      },
    ];

    return contracts;
  }

  deleteContracts(): DeleteToolAdapterConfig<{}>[] {
    return [];
  }

  getMethodRemoteContracts(): RemoteHttpToolConfig<{}>[] {
    const localContracts = this.getContracts();
    const remoteContracts: RemoteHttpToolConfig<{}>[] = [];

    setRemoteContract(
      localContracts,
      remoteContracts,
      "GET",
      this.getAuthServiceConfig(),
    );

    return remoteContracts;
  }

  isRemoteEnvContract(): boolean {
    return this.getRemoteHeaderSupported();
  }
}
