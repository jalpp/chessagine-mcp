import { Square, PAWN, KING, KNIGHT, QUEEN, BISHOP, ROOK } from "chess.js";

export const BOARD_CENTRE: Square[] = ["c4","c5","d4","d5","e4","e5","f4","f5"];
export const BOARD_FLANK: Square[] = ["a4", "a5", "b4", "b5", "h4", "h5", "g4", "g5"];

export const PIECE_VALUES = {
  [PAWN]: 100,
  [KNIGHT]: 300,
  [BISHOP]: 300,
  [ROOK]: 500,
  [QUEEN]: 900,
  [KING]: 0
};

export interface CastleRights {
  queenside: boolean;
  kingside: boolean;
}

export interface PositionalPawn {
  doublepawncount: number;
  isolatedpawncount: number;
  backwardpawncount: number;
  passedpawncount: number;
  weaknessscore: number;
}

export interface SpaceControl {
  centerspacecontrolscore: number;
  flankspacecontrolscore: number;
  totalspacecontrolscore: number;
}

export interface SidePiecePlacement {
  kingplacement: string[];
  queenplacement: string[];
  bishopplacement: string[];
  knightplacement: string[];
  rookplacement: string[];
  pawnplacement: string[];
}


export interface PieceAttackDefendInfo{
  attackerscount: number;
  defenderscount: number;
  attackers: string[];
  defenders: string[];
}

export interface KingSafety {
  kingsquare: string;
  attackerscount: number;
  defenderscount: number;
  pawnshield: number;
  kingsafetyscore: number;
  cancastle: boolean;
  hascastled: boolean;
}

export interface SideAttackerDefenders {
  pawnInfo: PieceAttackDefendInfo,
  knightInfo: PieceAttackDefendInfo,
  bishopInfo: PieceAttackDefendInfo,
  rookInfo: PieceAttackDefendInfo,
  queenInfo: PieceAttackDefendInfo,
  kingInfo: undefined
}

export interface PieceMobility {
  queenmobility: number;
  rookmobility: number;
  bishopmobility: number;
  knightmobility: number;
  totalmobility: number;
}

export interface SideSquareControl{
  lightSquares: string[],
  darkSquares: string[],
  lightSquareControl: number,
  darkSqaureControl: number
}

export interface MaterialInfo {
  materialcount: number;
  materialvalue: number;
  piececount: {
    pawns: number;
    knights: number;
    bishops: number;
    rooks: number;
    queens: number;
  };
  bishoppair: boolean;
}

export enum STATE_THEMES {
    CASTLE,
    MATERIAL,
    SPACE,
    PLACEMENT,
    POSITIONAL,
    SQAURE_CONTROL,
    KING_SAFETY,
    MOBILITY
}

export interface SideStateScores{
    castlingScore: CastleRights,
    materialScore: MaterialInfo,
    spaceScore: SpaceControl
    pieceplacementScore: SidePiecePlacement,
    positionalScore: PositionalPawn,
    squareControlScore: SideSquareControl,
    kingSafetyScore: KingSafety,
    pieceMobilityScore: PieceMobility
}

export interface BoardState {
  fen: string;
  validfen: boolean;
  legalMoves: string[];
  white: SideStateScores;
  black: SideStateScores;
  whitepieceattackerdefenderinfo: SideAttackerDefenders,
  blackpieceattackerdefenderinfo: SideAttackerDefenders,
  isCheckmate: boolean;
  isStalemate: boolean;
  isGameOver: boolean;
  moveNumber: number;
  sidetomove: string;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
}


interface Opening {
  eco: string;
  name: string;
}

interface Side {
  name: string;
  rating: number;
}

interface Game {
  uci: string;
  id: string;
  black: Side;
  white: Side;
  year: number;
  month: string;
}

export interface Moves {
  uci: string;
  san: string;
  averageRating: number;
  white: number;
  draws: number;
  black: number;
  game: Game;
  opening: Opening;
}

export interface MasterGames {
  opening: Opening;
  white: number;
  draws: number;
  black: number;
  moves: Moves[];
  topGames: Game[];
}

export interface HangingPieceAnalysis {
    hangingPieces: string[];
    unprotectedPieces: string[];
    semiProtectedPieces: string[];
}

export interface StockfishResponse {
    success: boolean;
    evaluation: number | null;
    mate: string | null;
    bestmove: string;
    continuation: string;
}
