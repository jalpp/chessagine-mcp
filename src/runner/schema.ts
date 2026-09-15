import z4 from "zod";

export const fenSchema = z4
  .string()
  .regex(
    /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [bw] [KQkq-]+ [a-h][1-8]|[a-h][1-8]|[a-h][1-8]|[a-h][1-8]|- \d+ \d+$/,
    "Invalid FEN format",
  )
  .describe("FEN string representing the board position");

export const sideSchema = z4.enum(["w", "b"]).describe("Side to evaluate from");

export const engineDepthSchema = z4
  .number()
  .min(12)
  .max(30)
  .describe("Search depth for Stockfish engine");

export const moveSchema = z4
  .string()
  .describe("The move to be played (in SAN or UCI format)");

export const movesListSchema = z4.array(moveSchema);

export const moveAlgSchema = z4
  .array(z4.string())
  .describe("Array of moves in algebraic notation");

export const variationSchema = z4
  .array(
    z4.object({
      name: z4.string(),
      moves: z4.array(z4.string()),
    }),
  )
  .describe("Array of variations to compare");

export const themesTypeSchema = z4
  .enum([
    "material",
    "mobility",
    "space",
    "positional",
    "kingSafety",
    "tactical",
    "lightsqaureControl",
    "darksqaureControl",
  ])
  .describe("Theme to track");

export const gamePgnSchema = z4.string().describe("Game PGN");

export const cbmGameIdSchema = z4
  .string()
  .describe("game ID to fetch chessboardmagic game");

export const cbmRepIdSchema = z4
  .string()
  .describe("repertoire ID to fetch a repertoire from chessboardmagic");

export const is3dSchema = z4
  .boolean()
  .describe("3D view of the board")
  .optional();

export const is960Schema = z4
  .boolean()
  .describe("Is this a chess960 variant user query");

export const tokenSchema = z4
  .string()
  .optional()
  .describe(
    "Bearer token to authenticate the request, falls back to server configured token if not provided",
  );

export const puzzleThemeSchema = z4
  .enum([
    "advancedPawn",
    "advantage",
    "anastasiaMate",
    "arabianMate",
    "attackingF2F7",
    "attraction",
    "backRankMate",
    "bishopEndgame",
    "bodenMate",
    "capturingDefender",
    "castling",
    "clearance",
    "crushing",
    "defensiveMove",
    "deflection",
    "discoveredAttack",
    "doubleBishopMate",
    "doubleCheck",
    "dovetailMate",
    "endgame",
    "enPassant",
    "equality",
    "exposedKing",
    "fork",
    "hangingPiece",
    "hookMate",
    "interference",
    "intermezzo",
    "killBoxMate",
    "kingsideAttack",
    "knightEndgame",
    "long",
    "master",
    "masterVsMaster",
    "mate",
    "mateIn1",
    "mateIn2",
    "mateIn3",
    "mateIn4",
    "mateIn5",
    "middlegame",
    "oneMove",
    "opening",
    "pawnEndgame",
    "pin",
    "promotion",
    "queenEndgame",
    "queenRookEndgame",
    "queensideAttack",
    "quietMove",
    "rookEndgame",
    "sacrifice",
    "short",
    "skewer",
    "smotheredMate",
    "superGM",
    "trappedPiece",
    "underPromotion",
    "veryLong",
    "vukovicMate",
    "xRayAttack",
    "zugzwang",
  ])
  .describe("Puzzle theme tag");

export const puzzleThemesArraySchema = z4
  .array(puzzleThemeSchema)
  .describe(
    "Array of puzzle theme tags to filter by (e.g., ['fork', 'pin', 'mateIn2'])",
  );

// ChessDojo training plan cohorts, mirrored from jackstenglein/chess-dojo's
// common/src/database/cohort.ts `dojoCohorts` array.
export const dojoCohortSchema = z4
  .enum([
    "0-300",
    "300-400",
    "400-500",
    "500-600",
    "600-700",
    "700-800",
    "800-900",
    "900-1000",
    "1000-1100",
    "1100-1200",
    "1200-1300",
    "1300-1400",
    "1400-1500",
    "1500-1600",
    "1600-1700",
    "1700-1800",
    "1800-1900",
    "1900-2000",
    "2000-2100",
    "2100-2200",
    "2200-2300",
    "2300-2400",
    "2400+",
  ])
  .describe(
    "ChessDojo training plan cohort range the user belongs to, e.g. '1200-1300'",
  );

export const dojoScoreboardOnlySchema = z4
  .boolean()
  .default(false)
  .describe(
    "Whether to only return requirements that are visible on the scoreboard",
  );

export const dojoRequirementIdSchema = z4
  .string()
  .min(1)
  .describe("The id of the ChessDojo training plan requirement to update");

export const dojoPreviousCountSchema = z4
  .number()
  .int()
  .describe("The count of the requirement before the update");

export const dojoNewCountSchema = z4
  .number()
  .int()
  .describe("The count of the requirement after the update");

export const dojoIncrementalMinutesSpentSchema = z4
  .number()
  .int()
  .default(0)
  .describe(
    "The amount by which the user is increasing their time spent, in minutes",
  );

export const dojoDateSchema = z4
  .string()
  .optional()
  .describe(
    "Optional RFC3339 timestamp the update should apply to (e.g. 2024-01-01T00:00:00.000Z). Omit or send an empty string to use the current time.",
  );

export const dojoNotesSchema = z4
  .string()
  .optional()
  .describe("Optional user comments for the progress update");

export const cbmPlayerSchema = z4
  .string()
  .optional()
  .describe(
    "Player name to filter by. Matches as a prefix against either the White or Black name. Optional. Provide 'fen' or 'player' (or both).",
  );

export const cbmSize = z4
  .string()
  .optional()
  .describe("Number of games to return per page (1-100). Defaults to 20.");

export const cbmPage = z4
  .number()
  .optional()
  .describe(
    "Page number to return, starting at 1. Defaults to 1. Use with 'totalPages' and 'hasMore' in the response to paginate through results.",
  );

export const cbmSort = z4
.enum(["elo", "date"])
.optional()
.describe(
  "Field to sort by: 'elo' (maximum rating between the two players) or 'date'. Defaults to 'elo'."
);

export const cbmDir = z4
.enum(["asc", "desc"])
.optional()
.describe(
  "Sort direction: 'asc' (ascending) or 'desc' (descending). Defaults to 'desc'."
)
  

// "player": {
//         "type": "string",
//         "description": "Player name to filter by. Matches as a prefix against either the White or Black name. Optional. Provide 'fen' or 'player' (or both)."
//       },
//       "size": {
//         "type": "number",
//         "description": "Number of games to return per page (1-100). Defaults to 20."
//       },
//       "page": {
//         "type": "number",
//         "description": "Page number to return, starting at 1. Defaults to 1. Use with 'totalPages' and 'hasMore' in the response to paginate through results."
//       },
//       "sort": {
//         "type": "string",
//         "description": "Field to sort by: 'elo' (maximum rating between the two players) or 'date'. Defaults to 'elo'.",
//         "enum": ["elo", "date"]
//       },
//       "dir": {
//         "type": "string",
//         "description": "Sort direction: 'asc' (ascending) or 'desc' (descending). Defaults to 'desc'.",
//         "enum": ["asc", "desc"]
