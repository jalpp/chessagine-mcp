import z from "zod";
export const fenSchema = z
    .string()
    .regex(/^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [bw] [KQkq-]+ [a-h][1-8]|[a-h][1-8]|[a-h][1-8]|[a-h][1-8]|- \d+ \d+$/, "Invalid FEN format").describe("FEN string representing the board position");
export const sideSchema = z.enum(["w", "b"]).describe("Side to evaluate from");
export const engineDepthSchema = z.number().min(12).max(15).describe("Search depth for Stockfish engine");
export const moveSchema = z.string().describe("The move to be played (in SAN or UCI format)");
export const gamePgnSchema = z.string().describe("Game PGN");
