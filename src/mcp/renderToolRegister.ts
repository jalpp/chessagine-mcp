import { McpServer } from "@modelcontextprotocol/server";
import type { McpServer as V1McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fenSchema, gamePgnSchema } from "../runner/schema.js";
import { registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { renderFenBoardHtml, renderPgnViewerHtml } from "./htmlBoardRenderer.js";

const RAW_HTML_INSTRUCTIONS =
  "Raw standalone HTML is included below as a fenced ```html code block. This does NOT " +
  "depend on the MCP UI/app resource above, so use it if your client/agent does not support " +
  "that extension: render the HTML directly (e.g. as an HTML artifact/preview) or save it to " +
  "a .html file and open it in a browser to show the visualization to the user.";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerRenderingTools(server: McpServer): void {
  const legacyServer = server as unknown as V1McpServer;

  const chessBoardResourceUri = "ui://chessagine/chess-board";
  
  registerAppResource(
    legacyServer,
    "Chess Board Viewer",
    chessBoardResourceUri,
    {
      description: "Interactive chess board visualization for single positions",
    },
    async () => {
      const htmlPath = path.join(__dirname, "../../dist/chess-board.html");
      const htmlContent = await readFile(htmlPath, "utf-8");
      
      return {
        contents: [
          {
            uri: chessBoardResourceUri,
            mimeType: "text/html;profile=mcp-app",
            text: htmlContent,
          },
        ],
      };
    }
  );

  
  registerAppTool(
    legacyServer,
    "render_chess_board",
    {
      title: "Render Chess Board",
      description: "Render an interactive chess board with the given position. Shows the board visually for a single position. Use this for displaying a specific chess position from FEN notation.",
      inputSchema: {
        fen: fenSchema
      },
      _meta: {
        ui: {
          resourceUri: chessBoardResourceUri,
          visibility: ["model", "app"],
        },
      },
    },
    async (args: { fen: string }) => {
      const { fen } = args;

      const content: Array<{ type: "text"; text: string }> = [
        {
          type: "text",
          text: `Rendering chess board for position: ${fen}`,
        },
      ];

      try {
        const html = renderFenBoardHtml(fen);
        content.push(
          { type: "text", text: RAW_HTML_INSTRUCTIONS },
          { type: "text", text: "```html\n" + html + "\n```" }
        );
      } catch (err) {
        content.push({
          type: "text",
          text: `Could not generate standalone HTML for this position: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      }

      return {
        content,
        _meta: {
          ui: {
            data: {
              fen,
            },
          },
        },
      };
    }
  );

  const pgnViewerResourceUri = "ui://chessagine/pgn-viewer";
  
  registerAppResource(
    legacyServer,
    "PGN Game Viewer",
    pgnViewerResourceUri,
    {
      description: "Interactive PGN game viewer with move navigation and analysis",
    },
    async () => {
      const htmlPath = path.join(__dirname, "../../dist/pgn-viewer.html");
      const htmlContent = await readFile(htmlPath, "utf-8");
      
      return {
        contents: [
          {
            uri: pgnViewerResourceUri,
            mimeType: "text/html;profile=mcp-app",
            text: htmlContent,
          },
        ],
      };
    }
  );


  registerAppTool(
    legacyServer,
    "render_pgn_viewer",
    {
      title: "Render PGN Game Viewer",
      description: "Render an interactive PGN game viewer that allows navigating through chess game moves. Use this for displaying complete chess games with move history, annotations, and the ability to step through moves. Supports PGN format with headers like Event, Site, Date, White, Black, Result, and move notation.",
      inputSchema: {
        pgn: gamePgnSchema
      },
      _meta: {
        ui: {
          resourceUri: pgnViewerResourceUri,
          visibility: ["model", "app"],
        },
      },
    },
    async (args: { pgn: string }) => {
      const { pgn } = args;

      const content: Array<{ type: "text"; text: string }> = [
        {
          type: "text",
          text: `Rendering PGN game viewer for game`,
        },
      ];

      try {
        const html = renderPgnViewerHtml(pgn);
        content.push(
          { type: "text", text: RAW_HTML_INSTRUCTIONS },
          { type: "text", text: "```html\n" + html + "\n```" }
        );
      } catch (err) {
        content.push({
          type: "text",
          text: `Could not generate standalone HTML for this game: ${
            err instanceof Error ? err.message : String(err)
          }`,
        });
      }

      return {
        content,
        _meta: {
          ui: {
            data: {
              pgn,
            },
          },
        },
      };
    }
  );
}