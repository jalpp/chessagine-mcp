
type ExternalService = 'SF_BASE_URL' | 'NN_BASE_URL' | 'CHESSDB_BASE_URL' | 'LICHESS_BASE_URL' | 'POSIRA_BASE_URL' | 'CBM_BASE_URL' | 'GUBBINS_BASE_URL' | 'DOJO_BASE_URL'

export const SERVICE_CONFIG_BASE_URL_MAP: Record<ExternalService, string> = {
    SF_BASE_URL: "https://stockfish-service-717993082875.us-central1.run.app",
    NN_BASE_URL: "https://www.chessagine.com/api/nn",
    CHESSDB_BASE_URL: "https://www.chessdb.cn/cdb.php",
    LICHESS_BASE_URL: "https://lichess.org",
    POSIRA_BASE_URL: "https://api.posira.dev",
    CBM_BASE_URL: "https://api.chessboardmagic.com",
    GUBBINS_BASE_URL: "https://api.chessgubbins.com",
    // Unlike the other services above, ChessDojo's PAT API has no single
    // author-owned public deployment -- it's the API Gateway URL for
    // whichever fork of the dojo /pat/* patch the caller has deployed.
    // DOJO_ENDPOINT lets that be overridden per-install; the default here
    // is the reference deployment used during development.
    DOJO_BASE_URL: process.env.DOJO_ENDPOINT ?? "https://c2qamdaw08.execute-api.us-east-1.amazonaws.com",
}; 