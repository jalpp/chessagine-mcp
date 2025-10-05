/**
 * Returns a PositionEval object parsed from the given engine results.
 * @param fen The FEN of the evaluated position.
 * @param results The result messages from the engine.
 * @param whiteToPlay Whether white is to play.
 * @returns A PositionEval object from the given engine results.
 */
export const parseEvaluationResults = (fen, results, whiteToPlay) => {
    const parsedResults = {
        lines: [],
    };
    const tempResults = {};
    for (const result of results) {
        if (result.startsWith('bestmove')) {
            const bestMove = getResultProperty(result, 'bestmove');
            if (bestMove) {
                parsedResults.bestMove = bestMove;
            }
        }
        if (result.startsWith('info')) {
            const pv = getResultPv(result);
            const resultPercentages = getResultPercentages(result);
            const multiPv = getResultProperty(result, 'multipv');
            const depth = getResultProperty(result, 'depth');
            if (!pv || !multiPv || !depth)
                continue;
            if (tempResults[multiPv] && parseInt(depth) < tempResults[multiPv].depth) {
                continue;
            }
            const cp = getResultProperty(result, 'cp');
            const mate = getResultProperty(result, 'mate');
            const nps = getResultProperty(result, 'nps');
            tempResults[multiPv] = {
                fen,
                pv,
                cp: cp ? parseInt(cp) : undefined,
                mate: mate ? parseInt(mate) : undefined,
                depth: parseInt(depth),
                multiPv: parseInt(multiPv),
                nps: nps ? parseInt(nps) : undefined,
                resultPercentages,
            };
        }
    }
    parsedResults.lines = Object.values(tempResults).sort(sortLines);
    if (!whiteToPlay) {
        parsedResults.lines = parsedResults.lines.map((line) => ({
            ...line,
            cp: line.cp ? -line.cp : line.cp,
            mate: line.mate ? -line.mate : line.mate,
        }));
    }
    return parsedResults;
};
/**
 * Sorts the given lines so that the best eval is first.
 * @param a The first line to compare.
 * @param b The second line to compare.
 * @returns A number indicating which line should be sorted first.
 */
export const sortLines = (a, b) => {
    if (a.mate !== undefined && b.mate !== undefined) {
        return a.mate - b.mate;
    }
    if (a.mate !== undefined) {
        return -a.mate;
    }
    if (b.mate !== undefined) {
        return b.mate;
    }
    return (b.cp ?? 0) - (a.cp ?? 0);
};
/**
 * Extracts the given property value from the result message.
 * @param result The result message from the engine.
 * @param property The property to get.
 * @returns The requested property value.
 */
export const getResultProperty = (result, property) => {
    const splitResult = result.split(' ');
    const propertyIndex = splitResult.indexOf(property);
    if (propertyIndex === -1 || propertyIndex + 1 >= splitResult.length) {
        return undefined;
    }
    return splitResult[propertyIndex + 1];
};
/**
 * Extracts the principal variations from the result message.
 * @param result The result message from the engine.
 * @returns The principal variations from the result message.
 */
const getResultPv = (result) => {
    const splitResult = result.split(' ');
    const pvIndex = splitResult.indexOf('pv');
    if (pvIndex === -1 || pvIndex + 1 >= splitResult.length) {
        return undefined;
    }
    return splitResult.slice(pvIndex + 1);
};
/**
 * Extracts the Win/Draw/Loss percentages from the result message.
 * @param result The result message from the engine.
 * @returns The WDL percentages from the result message.
 */
function getResultPercentages(result) {
    const splitResult = result.split(' ');
    const wdlIndex = splitResult.indexOf('wdl');
    if (wdlIndex === -1 || wdlIndex + 3 >= splitResult.length) {
        return undefined;
    }
    const win = parseInt(splitResult[wdlIndex + 1]);
    if (isNaN(win)) {
        return undefined;
    }
    const draw = parseInt(splitResult[wdlIndex + 2]);
    if (isNaN(draw)) {
        return undefined;
    }
    const loss = parseInt(splitResult[wdlIndex + 3]);
    if (isNaN(loss)) {
        return undefined;
    }
    return {
        win: win / 10,
        draw: draw / 10,
        loss: loss / 10,
    };
}
