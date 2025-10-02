import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StockfishProcess {
    private engine: ChildProcessWithoutNullStreams;

    constructor() {
        const enginePath = path.join(
            __dirname,
            "stockfish",
            "src",
            "stockfish-17.1-lite-single-03e3232.js"
        );

        this.engine = spawn(process.execPath, [enginePath], { 
            stdio: "pipe",
            // Isolate the subprocess environment
            env: {
                ...process.env,
                NODE_ENV: 'production' // Suppress debug logs
            }
        });

        this.engine.stderr.on("data", (data) => {
            console.error("Stockfish STDERR:", data.toString());
        });
    }

    send(cmd: string) {
        this.engine.stdin.write(cmd + "\n");
    }

    onMessage(cb: (line: string) => void) {
        this.engine.stdout.on("data", (data) => {
            const lines = data.toString().split("\n").filter(Boolean);
            lines.forEach((line: string) => {
                // Filter out Claude desktop app logs and non-UCI messages
                if (this.isValidUCIMessage(line)) {
                    cb(line);
                }
            });
        });
    }

    private isValidUCIMessage(line: string): boolean {
        // Known UCI message prefixes
        const uciPrefixes = [
            'id ',
            'uciok',
            'readyok',
            'bestmove',
            'info ',
            'option ',
            'Stockfish',
            'position',
            'copyprotection',
            'registration'
        ];

        // Filter out obvious non-UCI content
        const invalidPatterns = [
            /^\d{4}-\d{2}-\d{2}/,  // Timestamps
            /\[info\]/i,            // Log levels
            /\[error\]/i,
            /appVersion/i,
            /isPackaged/i,
            /Checking for updates/i,
            /Starting app/i,
            /^[\s{}\[\]]*$/        // Empty/whitespace/braces only
        ];

        // Check if line matches invalid patterns
        for (const pattern of invalidPatterns) {
            if (pattern.test(line)) {
                return false;
            }
        }

        // If line starts with known UCI prefix, it's valid
        const trimmed = line.trim();
        return uciPrefixes.some(prefix => trimmed.startsWith(prefix)) || trimmed.length > 0;
    }

    quit() {
        this.engine.kill();
    }
}