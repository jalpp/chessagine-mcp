import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fenSchema } from "../runner/schema.js";
import z from "zod";
import {
  getOpeningStats,
  getOpeningStatSpeech,
  getLichessOpeningStats,
} from "../tools/opening.js";
import {
  fetchPuzzle,
  getDifficultyLevel,
  getThemeDescriptions,
} from "../tools/puzzle.js";


export function registerLichessTools(server: McpServer): void {
  server.tool(
    "get-lichess-master-games",
    "Fetch master-level games and opening statistics from Lichess for a given position",
    {
      fen: fenSchema,
    },
    async ({ fen }) => {
      const masterData = await getOpeningStats(fen);
      if (!masterData) {
        return {
          content: [
            {
              type: "text",
              text: "No master game data available for this position.",
            },
          ],
        };
      }

      const speech = getOpeningStatSpeech(masterData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                data: masterData,
                analysis: speech,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "get-lichess-games",
    "Fetch Lichess user games and opening statistics for a given position",
    {
      fen: fenSchema,
    },
    async ({ fen }) => {
      const lichessData = await getLichessOpeningStats(fen);
      if (!lichessData) {
        return {
          content: [
            {
              type: "text",
              text: "No Lichess game data available for this position.",
            },
          ],
        };
      }

      const speech = getOpeningStatSpeech(lichessData);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                data: lichessData,
                analysis: speech,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "fetch-lichess-games",
    "Fetch the 20 most recent games for a Lichess user. Returns game details including player information, ratings, speed format, and PGN notation. Useful for analyzing a player's recent performance, openings, and game history.",
    {
      username: z.string().describe("Lichess username to fetch games for"),
    },
    async ({ username }) => {
      try {
        const response = await fetch(
          `https://lichess.org/api/games/user/${username}?until=${Date.now()}&max=20&pgnInJson=true&sort=dateDesc`,
          {
            method: "GET",
            headers: { accept: "application/x-ndjson" },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return {
              content: [
                {
                  type: "text",
                  text: `User "${username}" not found on Lichess.`,
                },
              ],
            };
          }
          throw new Error(`Failed to fetch games: ${response.statusText}`);
        }

        const rawData = await response.text();
        const games = rawData
          .split("\n")
          .filter(Boolean)
          .map((game) => JSON.parse(game));

        if (games.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No games found for user "${username}".`,
              },
            ],
          };
        }

        const formattedGames = games
          .map((game, index) => {
            const white = game.players.white;
            const black = game.players.black;
            const date = new Date(game.lastMoveAt).toLocaleString();

            return `Game ${index + 1}:
- ID: ${game.id}
- Speed: ${game.speed}
- Date: ${date}
- White: ${white.user?.name || "Anonymous"} (${white.rating || "?"})
- Black: ${black.user?.name || "Anonymous"} (${black.rating || "?"})
- PGN available: Yes`;
          })
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `Found ${games.length} recent games for "${username}":\n\n${formattedGames}\n\nRaw game data:`,
            },
            {
              type: "text",
              text: JSON.stringify(games, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching recent games: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "fetch-lichess-game",
    "Fetch a specific Lichess game in PGN format. Accepts either a full Lichess URL or a game ID. Returns the complete PGN notation with headers and moves, ready for analysis or display.",
    {
      gameUrlOrId: z
        .string()
        .describe(
          "Lichess game URL (e.g., https://lichess.org/abc12345) or game ID (e.g., abc12345)"
        ),
    },
    async ({ gameUrlOrId }) => {
      try {
        let gameId = gameUrlOrId;

        if (gameUrlOrId.includes("lichess.org") || gameUrlOrId.includes("/")) {
          try {
            const urlObj = new URL(gameUrlOrId);
            const pathname = urlObj.pathname;
            const gameIdMatch = pathname.match(
              /^\/([a-zA-Z0-9]{8,12})(?:\/|$)/
            );

            if (gameIdMatch) {
              gameId = gameIdMatch[1];
              if (gameId.length > 8) {
                gameId = gameId.substring(0, 8);
              }
            } else {
              throw new Error("Could not extract game ID from URL");
            }
          } catch (urlError) {
            const parts = gameUrlOrId.split("/");
            if (parts.length >= 4) {
              gameId = parts[3];
              const cleanGameId = gameId.split(/[?#]/)[0];
              gameId = cleanGameId.substring(0, 8);
            } else {
              throw new Error("Invalid URL format");
            }
          }
        }

        if (!gameId || gameId.length < 8) {
          return {
            content: [
              {
                type: "text",
                text: `Invalid game ID extracted: "${gameId}". Please provide a valid Lichess game URL or 8-character game ID.`,
              },
            ],
          };
        }

        const response = await fetch(
          `https://lichess.org/game/export/${gameId}`,
          {
            headers: {
              Accept: "application/x-chess-pgn",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch game: ${response.status} ${response.statusText}`
          );
        }

        const pgnText = await response.text();

        if (!pgnText || pgnText.trim() === "") {
          throw new Error("Empty PGN received from Lichess");
        }

        return {
          content: [
            {
              type: "text",
              text: `Successfully fetched game ${gameId}:\n\n${pgnText}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Lichess game: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  server.tool(
    "fetch-chess-puzzle",
    "Fetch a random chess puzzle from Lichess database. Can filter by themes and rating range. Use this to start a puzzle session with the user.",
    {
      themes: z
        .array(z.string())
        .optional()
        .describe(
          "Array of puzzle theme tags to filter by (e.g., ['fork', 'pin', 'mateIn2'])"
        ),
      ratingFrom: z
        .number()
        .min(1000)
        .optional()
        .describe("Minimum puzzle rating (e.g., 1000)"),
      ratingTo: z
        .number()
        .max(2500)
        .optional()
        .describe("Maximum puzzle rating (e.g., 2000)"),
    },
    async ({ themes, ratingFrom, ratingTo }) => {
      try {
        const puzzle = await fetchPuzzle({
          themes,
          ratingFrom,
          ratingTo,
        });

        if (!puzzle) {
          return {
            content: [
              {
                type: "text",
                text: "Failed to fetch puzzle. Please try again.",
              },
            ],
          };
        }

        const solutionMoves = puzzle.moves.split(" ");
        const firstMove = puzzle.preMove;

        const turnToMove = puzzle.FEN.split(" ")[1] === "w" ? "White" : "Black";

        const themeDescriptions = getThemeDescriptions(puzzle.themes);
        const difficultyLevel = getDifficultyLevel(puzzle.rating);

        const puzzleSession = {
          lichessId: puzzle.lichessId,
          rating: puzzle.rating,
          difficulty: difficultyLevel,
          themes: puzzle.themes,
          themeDescriptions: themeDescriptions,
          gameURL: puzzle.gameURL,

          previousFEN: puzzle.previousFEN,
          currentFEN: puzzle.FEN,
          turnToMove: turnToMove,

          opponentLastMove: firstMove,
          solution: solutionMoves,
          firstSolutionMove: solutionMoves[0],
          totalMoves: solutionMoves.length,

          instructions: `A puzzle session has been started. The opponent just played ${firstMove}. It's ${turnToMove} to move. Guide the user through finding the best move without immediately revealing the answer. If they need help, provide hints about the tactical theme (${themeDescriptions.join(
            ", "
          )}). The first move of the solution is ${solutionMoves[0]}.
        DO not show the themes to the user right away, hide the themes information from the start of the sesison, ONLY SHOW the themes when requested by user.`,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(puzzleSession, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching puzzle: ${error}`,
            },
          ],
        };
      }
    }
  );
}
