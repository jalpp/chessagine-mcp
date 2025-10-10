import { Chess } from "chess.js";
export const PROMPT_CATEGORIES = {
    quickPosition: {
        name: "Quick Position Analysis",
        prompts: [
            "Analyze this position from White's perspective: {fen}. Give material, mobility, space, king safety, and a 1-2 move best plan.",
            "From Black's view in this FEN: {fen}. What are the top 3 candidate moves and why?",
            "Evaluate the following position for White and propose a concrete improvement in 3 moves: {fen}."
        ]
    },
    themeScores: {
        name: "Theme-Focused Scores",
        prompts: [
            "Compute theme scores (material, mobility, space, positional, king safety) for this position: {fen}, color {color}.",
            "Track how material and king safety change over the next 5 moves in this variation: {fen}, moves: {moves}.",
            "For the move sequence {moves}, show the progression of the theme '{theme}' from {color}'s perspective."
        ]
    },
    variationExploration: {
        name: "Variation Exploration",
        prompts: [
            "From this root position {fen}, compare two lines: Line A {lineA}, Line B {lineB}. Which line maintains better space and king safety for {color}?",
            "Evaluate three candidate continuations after this move: {fen} … {move}. Provide a side-by-side theme analysis.",
            "Analyze a set of 2-3 variations from this root position and summarize which has the strongest material balance and initiative."
        ]
    },
    stockfishAnalysis: {
        name: "Stockfish Deep Dive",
        prompts: [
            "Provide a Stockfish-based best move and the rationale for this position: {fen}, depth {depth}.",
            "After {opening}, analyze the position with best move, key plans, and a short variation for both sides.",
            "Given this position: {fen}, show a candidate move, a main line, and an alternative line with evaluation at depth {depth}."
        ]
    },
    criticalMoments: {
        name: "Critical Moments",
        prompts: [
            "Identify the critical moments in this sequence: {moves}. Highlight where the material or king safety theme shifts significantly.",
            "Find the first moment in this line where {color}'s king safety worsens and suggest improvements for {opponent}: {fen}, moves: {moves}.",
            "List any moves in this variation that flip the evaluation by more than 0.5 pawns in favor of {color}."
        ]
    },
    learning: {
        name: "Learning & Training",
        prompts: [
            "Explain the key imbalances in this position and how to exploit them as {color}: {fen}.",
            "Create a 5-question drill from this position focusing on pawn structure and piece activity: {fen}.",
            "Provide a short, practical plan for {color} to convert a small material edge in this position: {fen}."
        ]
    },
    opening: {
        name: "Opening Repertoire",
        prompts: [
            "From this opening position, what are common middlegame plans for {color}, and how do you adapt if {opponent} plays {reply}?",
            "Generate a mini-repertoire for {color} against {opening} based on this transposition: {fen} with {color} to move.",
            "Summarize typical themes for {color} in this structure and suggest how {opponent} should respond."
        ]
    },
    visualization: {
        name: "Visualization",
        prompts: [
            "Render the board for this FEN and annotate the best move visually: {fen}, best move: {move}.",
            "Provide a move-by-move text walk-through of this variation with brief explanations for each ply: {fen}, moves: {moves}."
        ]
    },
    puzzles: {
        name: "Puzzles & Practice",
        prompts: [
            "Generate a tactical puzzle from this position with {color} to move that requires a forcing line to advantage: {fen}.",
            "Provide a mate-in-{n} puzzle derived from this position: {fen}, {color} to move.",
            "Give me three training prompts: 'find the best plan', 'spot the tactical shot', 'improve piece activity' using this position: {fen}."
        ]
    },
    custom: {
        name: "Custom Analysis",
        prompts: [
            "Explain the key priorities for {color} in a +/- balance equal position with this FEN: {fen}.",
            "Describe how to transition from this middlegame to an endgame favorable to {color}, given this structure: {fen}.",
            "If I want to practice endgames, give me a pared-down line from this position that leads to a rook ending."
        ]
    }
};
export function getChessDbNoteWord(note) {
    switch (note) {
        case "!":
            return "Best";
        case "*":
            return "Good";
        case "?":
            return "Bad";
        default:
            return "unknown";
    }
}
export function collectFensFromGame(pgn) {
    const fens = [];
    const chess = new Chess();
    chess.loadPgn(pgn);
    const history = chess.history({ verbose: true });
    for (let i = 0; i < history.length; i++) {
        fens[i] = history[i].after;
    }
    return fens;
}
export function validColorSchema(color) {
    if (color === "white")
        return "w";
    if (color === "black")
        return "b";
    if (color === "w")
        return color;
    if (color === "b")
        return color;
    return "w";
}
export function validateEngineDepth(depth) {
    if (depth < 12 || depth > 15) {
        return 15;
    }
    return depth;
}
