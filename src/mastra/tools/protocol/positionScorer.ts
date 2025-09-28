import { Color } from "chess.js";
import { getBoardState } from "./state";
import { BoardState, SideStateScores, STATE_THEMES } from "../types";

export class PositionScorer {
  private state: BoardState;
  private side: Color;

  constructor(fen: string, color: Color) {
    this.state = getBoardState(fen);
    this.side = color;
  }

  private get getSideScorer(): SideStateScores {
    return this.side == "w" ? this.state.white : this.state.black;
  }

  public getThemeScore(theme: STATE_THEMES): number {
    const currentSideState: SideStateScores = this.getSideScorer;
    switch (theme) {
      case STATE_THEMES.KING_SAFETY:
        return currentSideState.kingSafetyScore.kingsafetyscore;
      case STATE_THEMES.MATERIAL:
        return currentSideState.materialScore.materialcount;
      case STATE_THEMES.MOBILITY:
        return currentSideState.pieceMobilityScore.totalmobility;
      case STATE_THEMES.POSITIONAL:
        return currentSideState.positionalScore.weaknessscore;
      case STATE_THEMES.SPACE:
        return currentSideState.spaceScore.totalspacecontrolscore;
    }

    return 0;
  }
}
