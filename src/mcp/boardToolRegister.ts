import { McpServer } from "@modelcontextprotocol/server";
import { fenSchema, is960Schema, moveSchema, movesListSchema } from "../runner/schema.js";
import { postToolAdapter } from "@jalpp/mcp-adapter";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../services/config.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.SF_BASE_URL + '/board';

export function registerBoardStateTools(server: McpServer): void {

  postToolAdapter(server, {
    name: "is-legal-move",
    description: "Check if a given move is legal for the provided FEN position",
    endpoint: `${BASE_URL}/check-legal-move`,
    inputSchema: {
      fen: fenSchema,
      move: moveSchema,
      is960: is960Schema,
    },
  });

  postToolAdapter(server, {
      name: "get-boardstate-for-move",
      endpoint: `${BASE_URL}/state-for-move`,
      description: "Given a FEN and a move, returns a string describing the resulting board state after the move",
      inputSchema: {
          fen: fenSchema,
          move: moveSchema,
          is960: is960Schema
        },
    });

    postToolAdapter(server, {
      name: "parse-moves-for-boardstate",
      endpoint: `${BASE_URL}/ending-state`,
      description: "Given a FEN, and list of moves played from FEN, parses and returns the ending board state",
      inputSchema: {
          fen: fenSchema,
          moves: movesListSchema,
          is960: is960Schema
        },
    });

    postToolAdapter(server, {
      name: "get-boardstate-for-fen",
      endpoint: `${BASE_URL}/state-for-fen`,
      description: "Given a FEN, returns a string describing the resulting board state for that FEN",
      inputSchema: {
          fen: fenSchema,
          is960: is960Schema
        },
    });
}
