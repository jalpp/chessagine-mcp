import { Chess } from "chess.js";

export function getChessDbNoteWord(note: string): string {
  switch(note){
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

export function collectFensFromGame(pgn: string): string[]{
  const fens: string[] = [];

  const chess = new Chess();

  chess.loadPgn(pgn);

  const history = chess.history({verbose: true});

  for(let i = 0; i < history.length; i++){
    fens[i] = history[i].after;
  }

  return fens;
}

