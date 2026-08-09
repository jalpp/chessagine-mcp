import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { fenSchema } from "../runner/schema.js";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../services/config.js";
import { getToolAdapter, postToolAdapter } from "@jalpp/mcp-adapter";

export function registerChessDBTools(server: McpServer): void {
  getToolAdapter(server, {
    name: "get-chessdb-analysis",
    description: "Fetch position analysis and candidate moves from ChessDB",
    endpoint: "https://www.chessdb.cn/cdb.php?action=queryall&board=:fen&json=1",
    inputSchema: { fen: fenSchema },
  });

  getToolAdapter(server, {
    name: "get-chessdb-pv",
    description: "Fetch the principal variation (best line) for a position from ChessDB",
    endpoint: "https://www.chessdb.cn/cdb.php?action=querypv&board=:fen&stable=1&json=1",
    inputSchema: { fen: fenSchema },
  });

  getToolAdapter(server, {
    name: "queue-chessdb-analysis",
    description: "Queue a single chess position for background analysis on ChessDB",
    endpoint: "https://www.chessdb.cn/cdb.php?action=queue&board=:fen&json=1",
    inputSchema: { fen: fenSchema },
  });

  postToolAdapter(server, {
    name: "get-chessdb-expand-queue",
    description:
      "Expand a ChessDB position tree using breadth-first search and queue up to 20 positions via tree search",
    endpoint: `${SERVICE_CONFIG_BASE_URL_MAP.SF_BASE_URL}/expandqueue`,
    inputSchema: {
      fen: fenSchema,
      expansionDepth: z
        .number()
        .min(1)
        .max(10)
        .describe("BFS plies from root (max 10, default 4)"),
      expansionWidth: z
        .number()
        .min(1)
        .max(5)
        .describe("Branches followed per interior node (max 5, default 2)"),
      maxPositionsQueued: z
        .number()
        .min(1)
        .max(20)
        .describe("Hard cap on ChessDB queue calls (max 20, default 20)"),
    },
  });
}