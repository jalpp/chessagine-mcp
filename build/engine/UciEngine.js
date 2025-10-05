import { Mutex } from 'async-mutex';
import { ENGINE_DEPTH, ENGINE_HASH, ENGINE_LINE_COUNT, ENGINE_THREADS, } from './engine.js';
import { parseEvaluationResults } from './parseResults.js';
export class UciEngine {
    worker;
    ready = false;
    engineName;
    multiPv = ENGINE_LINE_COUNT.Default;
    threads = ENGINE_THREADS.Default;
    hash = Math.pow(2, ENGINE_HASH.Default);
    observers = new Set();
    stopMutex = new Mutex();
    runMutex = new Mutex();
    /**
     * Gets an EngineWorker from the given stockfish.js path.
     * @param path The stockfish.js path to create an EngineWorker from.
     * @returns An EngineWorker using the given stockfish.js path.
     */
    static workerFromPath(path) {
        const worker = new Worker(path);
        const engineWorker = {
            uci(command) {
                worker.postMessage(command);
            },
            listen(data) {
            },
            onError(msg) {
            },
            terminate() {
                worker.terminate();
            },
        };
        worker.onmessage = (event) => {
            engineWorker.listen(event.data);
        };
        worker.onerror = (err) => {
            engineWorker.onError(err);
        };
        return engineWorker;
    }
    /**
     * Constructs a new UciEngine instance.
     * @param engineName The name of the engine.
     * @param worker The engine worker.
     * @param debug Whether to print debug logs to the console. Defaults to true on non-prod and false on prod.
     */
    constructor(engineName, worker) {
        this.engineName = engineName;
        this.worker = worker;
    }
    /**
     * Initializes the engine. This must be called before evaluating any positions.
     */
    async init() {
        if (this.worker) {
            this.worker.listen = this.publishMessage;
            await this.sendCommands(['uci'], 'uciok');
            await this.sendCommands(['setoption name UCI_ShowWDL value true', 'isready'], 'readyok');
            await this.setMultiPv(this.multiPv, true);
            await this.setThreads(this.threads, true);
            await this.setHash(this.hash, true);
            this.ready = true;
        }
    }
    /**
     * Adds an observer to be notified of UCI messages.
     * @param observer The observer to add.
     */
    addObserver(observer) {
        this.observers.add(observer);
    }
    /**
     * Removes an observer from being notified of UCI messages.
     * @param observer The observer to remove.
     */
    removeObserver(observer) {
        this.observers.delete(observer);
    }
    /**
     * Publishes the given message to this UciEngine's observers.
     * @param message The message to publish.
     */
    publishMessage = (message) => {
        for (const observer of this.observers) {
            observer(message);
        }
    };
    /**
     * Sends the given UCI commands and resolves once the expected final message is returned.
     * @param commands The commands to send to the engine.
     * @param finalMessage The final message to wait for.
     * @param onNewMessage An optional function called with each new message from the engine.
     * @returns A Promise that resolves with all engine messages once finalMessage is detected.
     */
    async sendCommands(commands, finalMessage, onNewMessage) {
        return new Promise((resolve) => {
            if (!this.worker) {
                return [];
            }
            const messages = [];
            const observer = (message) => {
                messages.push(message);
                onNewMessage?.(messages);
                if (message.startsWith(finalMessage)) {
                    this.removeObserver(observer);
                    resolve(messages);
                }
            };
            this.addObserver(observer);
            for (const command of commands) {
                this.worker.uci(command);
            }
        });
    }
    /**
     * Sets the multiPv (number of lines) option. See https://disservin.github.io/stockfish-docs/stockfish-wiki/Terminology.html#multiple-pvs.
     * @param multiPv The number of lines to set.
     * @param forceInit If true, the option is set even if multiPv is equal to this.multiPv. If false, an error is thrown if the engine is not ready.
     * @returns A Promise that resolves once the engine is ready.
     */
    async setMultiPv(multiPv, forceInit = false) {
        if (!forceInit) {
            if (multiPv === this.multiPv)
                return;
            this.throwErrorIfNotReady();
        }
        if (multiPv > ENGINE_LINE_COUNT.Max) {
            throw new Error(`Invalid MultiPV value : ${multiPv}`);
        }
        if (multiPv < 1) {
            multiPv = 1;
        }
        await this.sendCommands([`setoption name MultiPV value ${multiPv}`, 'isready'], 'readyok');
        this.multiPv = multiPv;
    }
    /**
     * Sets the thread count for the engine.
     * @param threads The number of threads to use.
     * @param forceInit If true, the option is set even if threads is equal to this.threads.
     * @returns A Promise that resolves once the engine is ready.
     */
    async setThreads(threads, forceInit = false) {
        if (!forceInit) {
            if (threads === this.threads) {
                return;
            }
            this.throwErrorIfNotReady();
        }
        if (threads < ENGINE_THREADS.Min || threads > ENGINE_THREADS.Max) {
            this.threads = ENGINE_THREADS.Min;
        }
        await this.sendCommands([`setoption name Threads value ${threads}`, 'isready'], 'readyok');
        this.threads = threads;
    }
    /**
     * Sets the hash size in MB for the engine.
     * @param hash The hash size in MB.
     * @param forceInit If true, the option is set even if hash is equal to this.hash.
     * @returns A Promise that resolves once the engine is ready.
     */
    async setHash(hash, forceInit = false) {
        if (!forceInit) {
            if (hash === this.hash) {
                return;
            }
            this.throwErrorIfNotReady();
        }
        if (hash < Math.pow(2, ENGINE_HASH.Min) || hash > Math.pow(2, ENGINE_HASH.Max)) {
            // throw new Error(
            //     `Invalid threads value (${hash}) is not in range [${Math.pow(2, ENGINE_HASH.Min)}, ${Math.pow(2, ENGINE_HASH.Max)}]`,
            // );
            this.hash = Math.pow(2, ENGINE_HASH.Min);
        }
        await this.sendCommands([`setoption name Hash value ${hash}`, 'isready'], 'readyok');
        this.hash = hash;
    }
    /**
     * Throws an error if the engine is not ready.
     */
    throwErrorIfNotReady() {
        if (!this.ready) {
            throw new Error(`${this.engineName} is not ready`);
        }
    }
    /**
     * Shuts down the engine and terminates the worker running it.
     */
    shutdown() {
        this.ready = false;
        this.publishMessage('bestmove');
        this.worker?.uci('quit');
        this.worker?.terminate?.();
    }
    /**
     * @returns True if the engine is ready.
     */
    isReady() {
        return this.ready;
    }
    /**
     * Stops calculating as soon as possible.
     * @returns A Promise that resolves once the engine has stopped.
     */
    async stopSearch() {
        return this.sendCommands(['stop', 'isready'], 'readyok');
    }
    /**
     * Evaluates the given position, updating the eval as the engine runs.
     * @param fen The FEN to evaluate.
     * @param depth The depth to use when evaluating.
     * @param multiPv The number of lines to analyze.
     * @param setPartialEval The callback function that is sent eval updates.
     * @returns The engine's final PositionEval.
     */
    async evaluatePositionWithUpdate({ fen, depth = ENGINE_DEPTH.Default, multiPv = this.multiPv, threads = ENGINE_THREADS.Default, hash = Math.pow(2, ENGINE_HASH.Default), setPartialEval, }) {
        this.throwErrorIfNotReady();
        this.stopMutex.cancel();
        await this.stopMutex.acquire();
        // Only 1 thread can stop current position and start running SF on new position now
        await this.stopSearch();
        return this.runMutex.runExclusive(async () => {
            await this.setMultiPv(multiPv);
            await this.setThreads(threads);
            await this.setHash(hash);
            const whiteToPlay = fen.split(' ')[1] === 'w';
            const onNewMessage = (messages) => {
                const parsedResults = parseEvaluationResults(fen, messages, whiteToPlay);
                setPartialEval?.(parsedResults);
            };
            const promise = this.sendCommands([`position fen ${fen}`, `go depth ${depth}`], 'bestmove', onNewMessage);
            this.stopMutex.release(); // Other threads can now stop running this position
            const results = await promise;
            return parseEvaluationResults(fen, results, whiteToPlay);
        });
    }
}
