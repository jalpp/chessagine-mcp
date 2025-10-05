import { EngineName } from "./engine.js";
import { UciEngine } from "./UciEngine.js";
import { StockfishProcess } from "./stockfishprocess.js";
async function createStockfishEngineWorker() {
    const proc = new StockfishProcess();
    const engineWorker = {
        uci(command) {
            proc.send(command);
        },
        listen(data) {
        },
        onError(msg) {
        },
        terminate() {
            proc.quit();
        },
    };
    proc.onMessage((line) => {
        engineWorker.listen(line);
    });
    return engineWorker;
}
export class MCPStockfish extends UciEngine {
    constructor(worker) {
        super(EngineName.Stockfish17Point, worker);
    }
    static async create() {
        const worker = await createStockfishEngineWorker();
        return new MCPStockfish(worker);
    }
    async init() {
        await super.init();
        await this.sendCommands(["uci", "isready"], "uciok");
    }
}
