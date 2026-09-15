import { McpServer } from "@modelcontextprotocol/server";
import {
  cbmDir,
  cbmGameIdSchema,
  cbmPage,
  cbmPlayerSchema,
  cbmRepIdSchema,
  cbmSize,
  cbmSort,
  fenSchema,
  tokenSchema,
} from "../../runner/schema.js";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../../services/config.js";
import { remoteHttpToolAdapter } from "./remoteHttpToolAdapter.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.CBM_BASE_URL;

export function registerCBMToolsRemote(server: McpServer): void {
  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-repertoires",
    description:
      "Fetch user's chess repertoires from the Chessboard Magic Repertoire Builder",
    endpoint: `${BASE_URL}/mcp/repertoires`,
    method: "GET",
    inputSchema: { token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-games",
    description:
      "Fetch user's chess games from the Chessboard Magic Repertoire Builder",
    endpoint: `${BASE_URL}/mcp/games`,
    method: "GET",
    inputSchema: { token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-tcec-stats",
    description:
      "Fetch TCEC (Top Chess Engine Championship) statistics for a specific chess position",
    endpoint: `${BASE_URL}/mcp/tcec/stats`,
    method: "GET",
    inputSchema: { fen: fenSchema, token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-tcec-games",
    description:
      "Fetch actual TCEC (Top Chess Engine Championship) games that reached a specific position, or games played by a specific engine. Returns complete game records from the strongest engine matches. Results are paginated and can be sorted by rating or date. Provide at least one of 'fen' or 'player'. Each game includes both engine names, their ratings, the result, event details, ply count, and the full PGN move list. Use this to study how top engines played from a specific position and learn from their continuations.",
    endpoint: `${BASE_URL}/mcp/tcec/games`,
    method: "GET",
    inputSchema: {
      fen: fenSchema,
      player: cbmPlayerSchema,
      size: cbmSize,
      page: cbmPage,
      sort: cbmSort,
      dir: cbmDir,
      token: tokenSchema,
    },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-corr-stats",
    description:
      "Fetch correspondence chess statistics for a specific chess position",
    endpoint: `${BASE_URL}/mcp/corr/stats`,
    method: "GET",
    inputSchema: { fen: fenSchema, token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-corr-games",
    description:
      "Fetch correspondence chess games that reached a specific chess position",
    endpoint: `${BASE_URL}/mcp/corr/games`,
    method: "GET",
    inputSchema: {
      fen: fenSchema,
      player: cbmPlayerSchema,
      size: cbmSize,
      page: cbmPage,
      sort: cbmSort,
      dir: cbmDir,
      token: tokenSchema,
    },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-game-details",
    description:
      "Fetch user's single game's metadata, moves, tags, variations and comment links",
    endpoint: `${BASE_URL}/mcp/games/:gameId`,
    method: "GET",
    inputSchema: { gameId: cbmGameIdSchema, token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-chessboardmagic-repertoire-details",
    description:
      "Fetch user's single repertoire metadata, moves, variations and comment links",
    endpoint: `${BASE_URL}/mcp/repertoires/:repertoireId`,
    method: "GET",
    inputSchema: { repertoireId: cbmRepIdSchema, token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "chessboardMagicToken",
  });
}
