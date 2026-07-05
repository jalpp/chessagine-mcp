/**
 * @file Header-based credential extraction for the hosted remote MCP server.
 *
 * The remote deployment (api/mcp.ts, src/runner/remote.ts) never reads
 * process.env for Lichess/ChessBoardMagic/Posira credentials -- those env
 * vars only apply to the local stdio server (see lichessToolRegister.ts,
 * cbmToolRegister.ts, posiraToolRegister.ts). Remote callers instead supply
 * their own tokens per request, via one of:
 *
 *   1. A custom HTTP header (recommended) -- works with any MCP client that
 *      supports static per-server headers (LibreChat, Cursor, Cline, VS Code,
 *      Windsurf, etc.), and never puts the secret in the conversation/tool
 *      call transcript.
 *   2. A `token` tool-call argument -- the existing mechanism, used only when
 *      no header was supplied for that service. The LLM asks the user for
 *      the token and passes it in-band.
 *
 * When both are present for the same request, the header wins.
 */

export const REMOTE_CRED_HEADERS = {
  lichess: "x-lichess-token",
  chessboardMagic: "x-chessboardmagic-token",
  posira: "x-posira-token",
} as const;

export interface RemoteCredentials {
  lichessToken?: string;
  chessboardMagicToken?: string;
  posiraToken?: string;
}

type HeaderLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

function readHeader(headers: HeaderLike, name: string): string | undefined {
  if (!headers) return undefined;

  // Fetch API Headers (used by api/mcp.ts's Request object)
  if (typeof (headers as Headers).get === "function") {
    const value = (headers as Headers).get(name);
    return value ?? undefined;
  }

  // Plain Node.js http header maps (used by Express req.headers in remote.ts)
  const value = (headers as Record<string, string | string[] | undefined>)[
    name.toLowerCase()
  ];
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

/**
 * Extracts per-service credentials from request headers. Returns undefined
 * for any header that wasn't sent -- callers fall back to the tool-call
 * `token` argument in that case, never to an env var.
 */
export function extractRemoteCredentials(headers: HeaderLike): RemoteCredentials {
  return {
    lichessToken: readHeader(headers, REMOTE_CRED_HEADERS.lichess),
    chessboardMagicToken: readHeader(headers, REMOTE_CRED_HEADERS.chessboardMagic),
    posiraToken: readHeader(headers, REMOTE_CRED_HEADERS.posira),
  };
}

/**
 * Shape stashed into MCP's AuthInfo.extra (see mcp-handler's withMcpAuth in
 * api/mcp.ts) so every tool call's `extra.authInfo.extra` carries the
 * per-request credentials resolved once per request.
 */
export type RemoteAuthInfoExtra = RemoteCredentials;
