import { McpServer } from "@modelcontextprotocol/server";
import { gamePgnSchema, is960Schema } from "../runner/schema.js";
import z from "zod";
import { postToolAdapter } from "@jalpp/mcp-adapter";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../services/config.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.SF_BASE_URL + "/util";

export function registerUtilsTools(server: McpServer) {

  postToolAdapter(server, {
    name: "get-chess-knowledge",
    description: "Get the curated chess knowledge base as a JSON object.",
    endpoint: `${BASE_URL}/knowledge-base`,
  });

  postToolAdapter(server, {
    name: "get-puzzle-themes",
    description: "Get a list of all available puzzle themes that can be used to filter puzzles",
    endpoint: `${BASE_URL}/puzzle-themes`,
  });

  postToolAdapter(server, {
    name: "parse-pgn-into-move-fens",
    description: "Parses a PGN into a move list object containing move information like before, after FEN, move notation, and move numbers",
    endpoint: `${BASE_URL}/parse-pgn-into-fens`,
    inputSchema: { pgn: gamePgnSchema, is960: is960Schema },
  });

  postToolAdapter(server, {
    name: "get-fen-map-lookup",
    description: "Lookup fens for mapped SAN move, for given game PGN",
    endpoint: `${BASE_URL}/fen-map-lookup`,
    inputSchema: {
      pgn: gamePgnSchema,
      isAfter: z.boolean().describe("If true, maps moves to FEN after the move; if false, maps to FEN before the move"),
      is960: is960Schema
    },
  });
}
