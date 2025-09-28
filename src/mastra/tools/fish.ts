import { Chess} from 'chess.js';
import { getBoardState } from './protocol/state';
import { PositionPrompter } from './protocol/positionPrompter';

export interface StockfishResponse {
    success: boolean;
    evaluation: number | null;
    mate: string | null;
    bestmove: string;
    continuation: string;
}

export const getChessEvaluation = async (fen: string, depth: number) => {
    const stockfishUrl = `https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`;
    const response = await fetch(stockfishUrl);
    const data = (await response.json()) as StockfishResponse;

    return data;
};


export const generateChessAnalysis = (data: StockfishResponse, fen: string) => {
    if (!data.bestmove) {
        return {
            bestMove: 'Unknown',
            reasoning: 'Insufficient data to determine best move.',
            topLine: 'unknown',
            numberEval: 0,
        };
    }
    const chess = new Chess(fen);
    const bestMove = data.bestmove.split(' ')[1];
    const variation = data.continuation;
    const evalNumber = data.evaluation != null ? data.evaluation : -100000;
    const moves = variation.split(' ');

    let sanBestMove = '';
    let sanVariation = '';

    chess.move(bestMove);

    const history = chess.history({ verbose: true });

    sanBestMove = history[0].san;

    chess.load(fen);

    for (let i = 0; i < moves.length; i++) {
        chess.move(moves[i]);
    }

    const varHistory = chess.history({ verbose: true });

    for (let i = 0; i < varHistory.length; i++) {
        sanVariation += `${varHistory[i].san} `;
    }

    return {
        bestMove: sanBestMove || 'Unknown',
        reasoning: new PositionPrompter(getBoardState(fen)).generatePrompt(),
        topLine: sanVariation,
        numberEval: evalNumber,
    };
};

export interface HangingPieceAnalysis {
    hangingPieces: string[];
    unprotectedPieces: string[];
    semiProtectedPieces: string[];
}

