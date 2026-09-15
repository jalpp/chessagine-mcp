import {
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";

import { SERVICE_CONFIG_BASE_URL_MAP } from "../../services/config.js";
import {
  fenSchema,
  puzzleThemesArraySchema,
  tokenSchema,
} from "../../runner/schema.js";
import z4 from "zod/v4";

const staticLichessAuth = process.env.LICHESS_API_TOKEN
  ? { type: "bearer" as const, token: process.env.LICHESS_API_TOKEN }
  : undefined;

export const LichessContracts:
  | GetToolAdapterConfig<{}>[]
  | PostToolAdapterConfig<{}>[] = [
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
      username: z4.string().describe("Lichess username to fetch games for"),
      token: tokenSchema,
    },
    tokenParam: "token",
    auth: staticLichessAuth,
  },
  {
    name: "get-lichess-game",
    description: "Fetch a specific Lichess game in PGN format by game ID.",
    endpoint: "https://lichess.org/game/export/:gameId",
    inputSchema: {
      gameId: z4.string().describe("Lichess game ID (for example abc12345)"),
    },
  },
  {
    name: "fetch-chess-puzzle",
    description:
      "Fetch a random chess puzzle from the Lichess-backed puzzle service. Can filter by themes and rating range. Use this to start a puzzle session with the user.",
    endpoint: `${SERVICE_CONFIG_BASE_URL_MAP.SF_BASE_URL}/puzzle/builder`,
    inputSchema: {
      themes: puzzleThemesArraySchema,
      ratingFrom: z4
        .number()
        .min(1000)
        .describe("Minimum puzzle rating (e.g., 1000)"),
      ratingTo: z4
        .number()
        .max(2500)
        .describe("Maximum puzzle rating (e.g., 2000)"),
    },
  },
  {
    name: "get-lichess-studies",
    description:
      "Fetch all studies for a given Lichess user. Returns a list of studies with their IDs, names, and timestamps.",
    endpoint: "https://lichess.org/api/study/by/:username",
    inputSchema: {
      username: z4.string().describe("Lichess username to fetch studies for"),
      token: tokenSchema,
    },
    tokenParam: "token",
    auth: staticLichessAuth,
  },
  {
    name: "get-lichess-study-pgn",
    description:
      "Fetch a specific Lichess study in PGN format. Returns all chapters of the study as PGN.",
    endpoint: "https://lichess.org/api/study/:studyId.pgn",
    inputSchema: {
      studyId: z4.string().describe("Lichess study ID (for example WTvnkWAL)"),
      token: tokenSchema,
    },
    tokenParam: "token",
    auth: staticLichessAuth,
  },
];
