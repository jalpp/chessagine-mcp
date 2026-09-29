import axios from "axios";

// Lichess answers anonymous API calls without an identifying User-Agent
// with a generic 404 (see lichess-org/api#667). axios' default "axios/x.y"
// is not enough, so identify the app on every outgoing request. The
// published @jalpp/mcp-adapter shares this axios instance, so this covers
// both the stdio and remote registrations.
export const CHESSAGINE_USER_AGENT =
  "ChessAgine-MCP (+https://github.com/jalpp/chessagine-mcp)";

axios.defaults.headers.common["User-Agent"] = CHESSAGINE_USER_AGENT;
