import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fenSchema } from "../runner/schema.js";
import { sideSchema } from "../runner/schema.js";
import { viewBoardArtifact } from "../render/chessBoardRender.js";
import { gameRenderHtml } from "../render/gameRender.js";

export function registerRenderingTools(server: McpServer): void {
    server.tool(
      "generate-chess-board-view-artificat-html",
      "get HTML code to render chess board for given FEN, and use this code to generate an artificat",
      {
        fen: fenSchema,
        side: sideSchema,
      },
      async ({ fen, side = "w" }) => {
        try {
          
          const fullFen = fen.includes(' ') ? fen : `${fen} ${side} KQkq - 0 1`;
          
          const artifactHtml = viewBoardArtifact;
    
          return {
            content: [
              {
                type: "text",
                text: `Chess position rendered. FEN: ${fullFen}\n\nUse the artifact above to view the interactive chess board.`,
              },
              {
                type: "resource",
                resource: {
                  uri: `data:text/html;base64,${Buffer.from(artifactHtml).toString('base64')}`,
                  mimeType: "text/html",
                  text: artifactHtml
                }
              }
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error rendering chess board: ${error}`,
              },
            ],
          };
        }
      }
    );
    
    server.tool(
      "generate-dynamic-gameview-html",
      "get HTML code to render chess board for a game with multiple fens to render game view mode",
      {
      
      },
      async ({ }) => {
        try {
          
          const artifactHtml = gameRenderHtml;
    
          return {
            content: [
              {
                type: "text",
                text: `Chess positions rendered. Use the artifact above to view the interactive chess board.`,
              },
              {
                type: "resource",
                resource: {
                  uri: `data:text/html;base64,${Buffer.from(artifactHtml).toString('base64')}`,
                  mimeType: "text/html",
                  text: artifactHtml
                }
              }
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error rendering chess board: ${error}`,
              },
            ],
          };
        }
      }
    );
}