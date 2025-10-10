import { getBoardState } from "../themes/state.js";
import z from "zod";
import { fenSchema } from "../runner/schema.js";
import { moveSchema } from "../runner/schema.js";
import { calculateDeep } from "../themes/state.js";
import { PositionPrompter } from "../themes/positionPrompter.js";
export function registerStateTools(server) {
    server.tool("is-legal-move", "Check if a given move is legal for the provided FEN position", {
        fen: z.string().describe("FEN string representing the board position, the fen must be in full form containing which side to move"),
        move: z.string().describe("The move to be played (in SAN or UCI format)")
    }, async ({ fen, move }) => {
        try {
            const boardState = getBoardState(fen);
            if (!boardState) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ isLegal: false, message: "Invalid FEN string" }, null, 2),
                        },
                    ],
                };
            }
            const legalMoves = boardState.legalMoves || [];
            const moveToCheck = move.trim();
            const isLegal = legalMoves.includes(moveToCheck) ||
                legalMoves.map((m) => m.toLowerCase()).includes(moveToCheck.toLowerCase());
            const result = {
                isLegal,
                message: isLegal
                    ? "Move is legal."
                    : "Move is not legal in this position.",
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ isLegal: false, message: "Error checking move legality." }, null, 2),
                    },
                ],
            };
        }
    });
    server.tool("boardstate-to-prompt", "Given a FEN and a move, returns a string describing the resulting board state after the move", {
        fen: fenSchema,
        move: moveSchema,
    }, async ({ fen, move }) => {
        try {
            const boardState = calculateDeep(fen, move);
            if (!boardState || !boardState.validfen) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Invalid move or FEN. Cannot generate board state prompt.",
                        },
                    ],
                };
            }
            const prompt = new PositionPrompter(boardState).generatePrompt();
            return {
                content: [
                    {
                        type: "text",
                        text: prompt,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error generating board state prompt:`,
                    },
                ],
            };
        }
    });
}
