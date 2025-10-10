import { getBoardState } from "./state.js";
import { STATE_THEMES } from "../types/types.js";
export class PositionScorer {
    state;
    side;
    constructor(fen, color) {
        this.state = getBoardState(fen);
        this.side = color;
    }
    get getSideScorer() {
        return this.side == "w" ? this.state.white : this.state.black;
    }
    getThemeScore(theme) {
        const currentSideState = this.getSideScorer;
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
