import { Worker } from 'worker_threads';
import { EngineName } from './engine.js';
import { UciEngine } from './UciEngine.js';
/**
 * Creates an EngineWorker from a Node.js worker thread for Stockfish WASM
 * @param workerPath Path to the worker script
 * @returns An EngineWorker compatible with UciEngine
 */
export function createNodeEngineWorker(workerPath) {
    const worker = new Worker(workerPath);
    const engineWorker = {
        uci(command) {
            worker.postMessage(command);
        },
        listen(data) {
            console.log(data);
        },
        onError(msg) {
            console.error(msg);
        },
        terminate() {
            worker.terminate();
        },
    };
    worker.on('message', (data) => {
        engineWorker.listen(data);
    });
    worker.on('error', (err) => {
        engineWorker.onError(err);
    });
    return engineWorker;
}
export class MCPStockfish extends UciEngine {
    constructor(jsPath) {
        const worker = createNodeEngineWorker(jsPath);
        //UciEngine.workerFromPath("./stockfish-17.1-lite-single-03e3232.js")
        super(EngineName.Stockfish17Point, worker);
    }
    async init() {
        await super.init();
        await this.sendCommands(['position startpos', 'go depth 1'], 'bestmove');
    }
}
