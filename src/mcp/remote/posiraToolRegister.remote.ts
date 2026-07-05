/**
 * @file Remote-only Posira tool registration.
 *
 * Unlike src/mcp/posiraToolRegister.ts (local stdio, env-only), these tools
 * now accept a per-request credential via the X-Posira-Token header (see
 * remoteAuth.ts), falling back to a `token` tool-call argument -- this is
 * new: the local/env-only version never had a per-call override at all.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { tokenSchema } from "../../runner/schema.js";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../../services/config.js";
import { remoteHttpToolAdapter } from "./remoteHttpToolAdapter.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.POSIRA_BASE_URL;

export function registerPosiraToolsRemote(server: McpServer): void {

  remoteHttpToolAdapter(server, {
    name: "get-posira-explorer",
    description: "Look up opening statistics for a given chess position. Returns the most common next moves with game counts and win/draw/loss percentages, derived from 7.5 billion Lichess games. Able to filter by ratings, title, and speeds",
    endpoint: `${BASE_URL}/api/v1/explorer`,
    method: "GET",
    inputSchema: {
      moves: z.string().optional().describe("Comma-separated SAN moves from the starting position, e.g. 'e4,c5,Nf3'. Required if fen is not provided."),
      fen: z.string().optional().describe("FEN string of the position to query. Alternative to moves. Required if moves is not provided."),
      top_n: z.number().min(1).max(50).optional().describe("Maximum number of moves to return. Default: 12, max: 50."),
      speeds: z.string().optional().describe("Comma-separated speed filters: ultrabulllet, bullet, blitz, rapid, classical, correspondence. e.g. 'blitz,rapid'"),
      ratings: z.string().optional().describe("Comma-separated Elo bracket filters: 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500. e.g. '1800,2000,2200'"),
      titled: z.boolean().optional().describe("Filter to titled players only (GM, IM, FM, etc.)"),
      token: tokenSchema,
    },
    tokenParam: "token",
    headerCredKey: "posiraToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-posira-health",
    description: "Check Posira API status and database statistics including total games indexed and unique positions.",
    endpoint: `${BASE_URL}/api/v1/health`,
    method: "GET",
    inputSchema: { token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "posiraToken",
  });
}
