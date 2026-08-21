import { McpServer } from "@modelcontextprotocol/server";
import { cbmGameIdSchema, cbmRepIdSchema, fenSchema } from "../runner/schema.js";
import { getToolAdapter } from "@jalpp/mcp-adapter";
import { tokenSchema } from "../runner/schema.js";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../services/config.js";


const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.CBM_BASE_URL;

const staticAuth = {
  type: "bearer" as const,
  token: process.env.CHESSBOARD_MAGIC_PAT ?? "",
};


export function registerCBMTools(mcpserver: McpServer) {

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-repertoires",
    description: "Fetch user's chess repertoires from the Chessboard Magic Repertoire Builder",
    endpoint: `${BASE_URL}/mcp/repertoires`,
    inputSchema: { token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-games",
    description: "Fetch user's chess games from the Chessboard Magic Repertoire Builder",
    endpoint: `${BASE_URL}/mcp/games`,
    inputSchema: { token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-tcec-stats",
    description: "Fetch TCEC (Top Chess Engine Championship) statistics for a specific chess position",
    endpoint: `${BASE_URL}/mcp/tcec/stats`,
    inputSchema: { fen: fenSchema, token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-tcec-games",
    description: "Fetch TCEC games that reached a specific chess position",
    endpoint: `${BASE_URL}/mcp/tcec/games`,
    inputSchema: { fen: fenSchema, token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-corr-stats",
    description: "Fetch correspondence chess statistics for a specific chess position",
    endpoint: `${BASE_URL}/mcp/corr/stats`,
    inputSchema: { fen: fenSchema, token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-corr-games",
    description: "Fetch correspondence chess games that reached a specific chess position",
    endpoint: `${BASE_URL}/mcp/corr/games`,
    inputSchema: { fen: fenSchema, token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-game-details",
    description: "Fetch user's single game's metadata, moves, tags, variations and comment links",
    endpoint: `${BASE_URL}/mcp/games/:gameId`,
    inputSchema: { gameId: cbmGameIdSchema, token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });

  getToolAdapter(mcpserver, {
    name: "get-chessboardmagic-repertoire-details",
    description: "Fetch user's single repertoire metadata, moves, variations and comment links",
    endpoint: `${BASE_URL}/mcp/repertoires/:repertoireId`,
    inputSchema: { repertoireId: cbmRepIdSchema, token: tokenSchema },
    tokenParam: "token",
    auth: staticAuth,
  });
}