import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { registerAgineRemote } from "../src/mcp/remote/registerAgineRemote.js";
import { extractRemoteCredentials } from "../src/mcp/remote/remoteAuth.js";

const mcpHandler = createMcpHandler(
  (server) => {
    registerAgineRemote(server);
  },
  { serverInfo: { name: "ChessAgine", version: "0.7.7" } },
  { basePath: "", maxDuration: 60, sessionIdGenerator: undefined },
);

// Resolves per-request Lichess/ChessBoard Magic/Posira credentials from
// X-Lichess-Token / X-Chessboardmagic-Token / X-Posira-Token headers (see
// src/mcp/remote/remoteAuth.ts) and stashes them in AuthInfo.extra, which the
// MCP SDK threads through to every tool call as `extra.authInfo.extra`.
//
// This is NOT an OAuth flow -- we aren't validating these values against an
// authorization server, just carrying whatever the client's own config sent
// so remoteHttpToolAdapter (see src/mcp/remote/remoteHttpToolAdapter.ts) can
// use them as bearer tokens against Lichess/CBM/Posira. `required: false`
// means requests with no headers at all still succeed -- those tools then
// fall back to a `token` tool-call argument, and never to an env var, since
// this remote deployment intentionally has no credentials of its own.
const verifyToken = async (req: Request): Promise<AuthInfo | undefined> => {
  const extra = extractRemoteCredentials(req.headers) as Record<string, unknown>;
  return {
    token: "chessagine-remote-passthrough",
    clientId: "chessagine-remote",
    scopes: [],
    extra,
  };
};

const authedHandler = withMcpAuth(mcpHandler, verifyToken, { required: false });

const handler = async (request: Request) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    url.pathname = url.pathname.replace("/api/", "/");
    return authedHandler(new Request(url.toString(), request));
  }
  return authedHandler(request);
};

export { handler as GET, handler as POST};
