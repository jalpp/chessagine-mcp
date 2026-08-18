import z from "zod";

export const fenSchema = z
  .string()
  .regex(
    /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [bw] [KQkq-]+ [a-h][1-8]|[a-h][1-8]|[a-h][1-8]|[a-h][1-8]|- \d+ \d+$/,
    "Invalid FEN format",
  )
  .describe("FEN string representing the board position");

export const sideSchema = z.enum(["w", "b"]).describe("Side to evaluate from");

export const engineDepthSchema = z
  .number()
  .min(12)
  .max(30)
  .describe("Search depth for Stockfish engine");

export const moveSchema = z
  .string()
  .describe("The move to be played (in SAN or UCI format)");

export const movesListSchema = z.array(moveSchema);

export const moveAlgSchema = z
  .array(z.string())
  .describe("Array of moves in algebraic notation");

export const variationSchema = z
  .array(
    z.object({
      name: z.string(),
      moves: z.array(z.string()),
    }),
  )
  .describe("Array of variations to compare");

export const themesTypeSchema = z
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

export const gamePgnSchema = z.string().describe("Game PGN");

export const cbmGameIdSchema = z
  .string()
  .describe("game ID to fetch chessboardmagic game");

export const cbmRepIdSchema = z
  .string()
  .describe("repertoire ID to fetch a repertoire from chessboardmagic");

export const is3dSchema = z
  .boolean()
  .describe("3D view of the board")
  .optional();

export const is960Schema = z
  .boolean()
  .describe("Is this a chess960 variant user query");

export const tokenSchema = z
  .string()
  .optional()
  .describe(
    "Bearer token to authenticate the request, falls back to server configured token if not provided",
  );


export const puzzleThemeSchema = z.enum([
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
]).describe("Puzzle theme tag");

export const puzzleThemesArraySchema = z
  .array(puzzleThemeSchema)
  .describe("Array of puzzle theme tags to filter by (e.g., ['fork', 'pin', 'mateIn2'])");

// ChessDojo training plan cohorts, mirrored from jackstenglein/chess-dojo's
// common/src/database/cohort.ts `dojoCohorts` array.
export const dojoCohortSchema = z
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
  .describe("ChessDojo training plan cohort range the user belongs to, e.g. '1200-1300'");

export const dojoScoreboardOnlySchema = z
  .boolean()
  .default(false)
  .describe("Whether to only return requirements that are visible on the scoreboard");


export const dojoRequirementIdSchema = z
  .string()
  .min(1)
  .describe("The id of the ChessDojo training plan requirement to update");

export const dojoPreviousCountSchema = z
  .number()
  .int()
  .describe("The count of the requirement before the update");

export const dojoNewCountSchema = z
  .number()
  .int()
  .describe("The count of the requirement after the update");

export const dojoIncrementalMinutesSpentSchema = z
  .number()
  .int()
  .default(0)
  .describe("The amount by which the user is increasing their time spent, in minutes");

export const dojoDateSchema = z
  .string()
  .optional()
  .describe(
    "Optional RFC3339 timestamp the update should apply to (e.g. 2024-01-01T00:00:00.000Z). Omit or send an empty string to use the current time.",
  );

export const dojoNotesSchema = z
  .string()
  .optional()
  .describe("Optional user comments for the progress update");