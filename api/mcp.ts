import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { registerAgineRemote } from "../src/mcp/registerAgineRemote.js";
import { extractRemoteCredentials } from "../src/mcp/remote/remoteAuth.js";

const mcpHandler = createMcpHandler(
  (server) => {
    registerAgineRemote(server);
  },
  { serverInfo: { name: "ChessAgine", version: "0.7.9" } },
);


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
