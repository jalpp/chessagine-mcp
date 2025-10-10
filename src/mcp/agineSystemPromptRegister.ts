import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fenSchema } from "../runner/schema.js";
import z from "zod";
import {
  agineSystemPrompt,
  agineDesigner,
  chessAgineAnnoPrompt,
} from "../prompts/prompt.js";


export function registerAgineSystemPrompt(server: McpServer): void {
  server.registerPrompt(
    "analyze-position",
    {
      title: "Analyze Chess Position",
      description:
        "Analyze a chess position comprehensively using chess principles",
      argsSchema: {
        fen: fenSchema,
        side: z
          .string()
          .optional()
          .describe("Side to analyze from (white/black)"),
      },
    },
    ({ fen, side = "white" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a chess master analyzing this position from ${side}'s perspective.

FEN: ${fen}

Please provide a comprehensive analysis covering:

1. **Material Count**: Compare material for both sides
2. **King Safety**: Evaluate king positions and potential threats
3. **Piece Activity**: Assess how well pieces are placed
4. **Pawn Structure**: Analyze pawn chains, weaknesses, and strengths
5. **Control of Key Squares**: Important central and strategic squares
6. **Tactical Opportunities**: Look for pins, forks, skewers, discovered attacks
7. **Strategic Plans**: Suggest concrete plans for both sides

Use chess notation and be specific about piece placements and tactical motifs. Conclude with an evaluation (advantage to white/black/equal) and recommend the best continuation.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "ChessAgine Mode",
    {
      title: "Make Claude behave like chessagine",
      description:
        "Use Chess Agent + Engine system prompt to make Claude a better chess helper",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${agineSystemPrompt}`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "Become-ChessAgine-Chess-Annotation-Expert",
    {
      title: "Make Claude behave like chessagine annotation expert",
      description:
        "Use Chess Agent + Engine annotation system prompt to make Claude a better chess writing",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${chessAgineAnnoPrompt}`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "Design-ChessDashboards",
    {
      title: "Use chessdashboard UI design guide to create dashboards for user",
      description:
        "Use chessdashboard UI design guide to create dashboards for user",
    },
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${agineDesigner}`,
          },
        },
      ],
    })
  );
}
