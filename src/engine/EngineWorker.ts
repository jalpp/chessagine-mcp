export interface EngineWorker {
    /**
     * Sends the given UCI command. The response can be received asynchronously via listen.
     * @param command The UCI command to send.
     */
    uci(command: string): void;

    /**
     * Receives data back from the worker.
     * @param data The data sent from the worker.
     */
    listen: (data: string) => void;

    // index arguments are used for dual net sf builds, 0 for big, 1 for small, otherwise ignore

    setNnueBuffer?: (data: Uint8Array, index?: number) => void;

    getRecommendedNnue?: (index?: number) => string; // returns a bare filename

    /**
     * Receives error messages from the worker.
     * @param err The error message from the worker.
     */
    onError: (err: unknown) => void;

    /**
     * Shuts down the worker.
     */
    terminate?: () => void;
}
