import { BOARD_CENTRE, BOARD_FLANK } from "../types/types.js";
;
function getSpaceControl(chess, side) {
    let spaceMeasure = 0;
    for (const sq of BOARD_CENTRE) {
        spaceMeasure += chess.attackers(sq, side).length;
    }
    return spaceMeasure;
}
function getFlankSpaceControl(chess, side) {
    let flankMeasure = 0;
    for (const sq of BOARD_FLANK) {
        flankMeasure += chess.attackers(sq, side).length;
    }
    return flankMeasure;
}
export function getSideSpaceControl(chess, side) {
    const centre = getSpaceControl(chess, side);
    const flank = getFlankSpaceControl(chess, side);
    return {
        centerspacecontrolscore: centre,
        flankspacecontrolscore: flank,
        totalspacecontrolscore: centre + flank
    };
}
