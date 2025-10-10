// Popular chess puzzle themes
export const PUZZLE_THEMES = [
    { tag: "advancedPawn", description: "Advanced Pawn" },
    { tag: "advantage", description: "Advantage" },
    { tag: "anastasiaMate", description: "Anastasia's Mate" },
    { tag: "arabianMate", description: "Arabian Mate" },
    { tag: "attackingF2F7", description: "Attacking f2/f7" },
    { tag: "attraction", description: "Attraction" },
    { tag: "backRankMate", description: "Back Rank Mate" },
    { tag: "bishopEndgame", description: "Bishop Endgame" },
    { tag: "bodenMate", description: "Boden Mate" },
    { tag: "capturingDefender", description: "Capturing Defender" },
    { tag: "castling", description: "Castling" },
    { tag: "clearance", description: "Clearance" },
    { tag: "crushing", description: "Crushing" },
    { tag: "defensiveMove", description: "Defensive Move" },
    { tag: "deflection", description: "Deflection" },
    { tag: "discoveredAttack", description: "Discovered Attack" },
    { tag: "doubleBishopMate", description: "Double Bishop Mate" },
    { tag: "doubleCheck", description: "Double Check" },
    { tag: "dovetailMate", description: "Dovetail Mate" },
    { tag: "endgame", description: "Endgame" },
    { tag: "enPassant", description: "En Passant" },
    { tag: "equality", description: "Equality" },
    { tag: "exposedKing", description: "Exposed King" },
    { tag: "fork", description: "Fork" },
    { tag: "hangingPiece", description: "Hanging Piece" },
    { tag: "hookMate", description: "Hook Mate" },
    { tag: "interference", description: "Interference" },
    { tag: "intermezzo", description: "Intermezzo" },
    { tag: "killBoxMate", description: "Kill Box Mate" },
    { tag: "kingsideAttack", description: "Kingside Attack" },
    { tag: "knightEndgame", description: "Knight Endgame" },
    { tag: "long", description: "Long" },
    { tag: "master", description: "Master" },
    { tag: "masterVsMaster", description: "Master vs Master" },
    { tag: "mate", description: "Mate" },
    { tag: "mateIn1", description: "Mate In 1" },
    { tag: "mateIn2", description: "Mate In 2" },
    { tag: "mateIn3", description: "Mate In 3" },
    { tag: "mateIn4", description: "Mate In 4" },
    { tag: "mateIn5", description: "Mate In 5" },
    { tag: "middlegame", description: "Middlegame" },
    { tag: "oneMove", description: "One Move" },
    { tag: "opening", description: "Opening" },
    { tag: "pawnEndgame", description: "Pawn Endgame" },
    { tag: "pin", description: "Pin" },
    { tag: "promotion", description: "Promotion" },
    { tag: "queenEndgame", description: "Queen Endgame" },
    { tag: "queenRookEndgame", description: "Queen Rook Endgame" },
    { tag: "queensideAttack", description: "Queenside Attack" },
    { tag: "quietMove", description: "Quiet Move" },
    { tag: "rookEndgame", description: "Rook Endgame" },
    { tag: "sacrifice", description: "Sacrifice" },
    { tag: "short", description: "Short" },
    { tag: "skewer", description: "Skewer" },
    { tag: "smotheredMate", description: "Smothered Mate" },
    { tag: "superGM", description: "Super GM" },
    { tag: "trappedPiece", description: "Trapped Piece" },
    { tag: "underPromotion", description: "Under Promotion" },
    { tag: "veryLong", description: "Very Long" },
    { tag: "vukovicMate", description: "Vukovic's Mate" },
    { tag: "xRayAttack", description: "X Ray Attack" },
    { tag: "zugzwang", description: "Zugzwang" },
];
/**
 * Fetch a random puzzle from the ChessGubbins API
 * @param query - Optional query parameters for filtering puzzles
 * @returns PuzzleData or null if fetch fails
 */
export async function fetchPuzzle(query) {
    try {
        let url = "https://api.chessgubbins.com/puzzles/random";
        const params = new URLSearchParams();
        // Add theme filters if provided
        if (query?.themes && query.themes.length > 0) {
            params.append("themes", query.themes.join(","));
        }
        // Add rating range if provided
        if (query?.ratingFrom && query?.ratingTo) {
            params.append("ratingFrom", query.ratingFrom.toString());
            params.append("ratingTo", query.ratingTo.toString());
        }
        // Append query parameters if any exist
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch puzzle: HTTP ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching puzzle:", error);
        return null;
    }
}
/**
 * Get the difficulty level description based on rating
 */
export function getDifficultyLevel(rating) {
    if (rating < 1000)
        return "Beginner";
    if (rating < 1500)
        return "Intermediate";
    if (rating < 2000)
        return "Advanced";
    if (rating < 2500)
        return "Expert";
    return "Master";
}
/**
 * Format puzzle solution moves into a readable string
 */
export function formatSolution(moves) {
    const moveList = moves.split(" ");
    return moveList.join(", ");
}
/**
 * Get theme descriptions for a puzzle
 */
export function getThemeDescriptions(themeTags) {
    return themeTags
        .map(tag => {
        const theme = PUZZLE_THEMES.find(t => t.tag === tag);
        return theme ? theme.description : tag;
    });
}
