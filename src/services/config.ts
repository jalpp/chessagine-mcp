
export type ExternalService = 'SF_BASE_URL' | 'BOARD_BASE_URL' | 'THEME_BASE_URL' | 'UTIL_BASE_URL' | 'NN_BASE_URL' | 'CHESSDB_BASE_URL' | 'LICHESS_BASE_URL' | 'POSIRA_BASE_URL' | 'CBM_BASE_URL' | 'DOJO_BASE_URL' 

export const SERVICE_CONFIG_BASE_URL_MAP: Record<ExternalService, string> = {
    SF_BASE_URL: "https://stockfish-service-717993082875.us-central1.run.app",
    THEME_BASE_URL: "https://stockfish-service-717993082875.us-central1.run.app/themes",
    UTIL_BASE_URL: "https://stockfish-service-717993082875.us-central1.run.app/util",
    BOARD_BASE_URL: "https://stockfish-service-717993082875.us-central1.run.app/board",
    NN_BASE_URL: "https://www.chessagine.com/api/nn",
    CHESSDB_BASE_URL: "https://www.chessdb.cn/cdb.php",
    LICHESS_BASE_URL: "https://lichess.org",
    POSIRA_BASE_URL: "https://api.posira.dev",
    CBM_BASE_URL: "https://api.chessboardmagic.com",
    DOJO_BASE_URL: process.env.DOJO_ENDPOINT ?? "https://c2qamdaw08.execute-api.us-east-1.amazonaws.com",
};

export const SERVICE_CONFIG_REMOTE_API_HEADER_KEY: Record<ExternalService, string | undefined> = {
     SF_BASE_URL: undefined,
    THEME_BASE_URL: undefined,
    UTIL_BASE_URL: undefined,
    BOARD_BASE_URL: undefined,
    NN_BASE_URL: undefined,
    CHESSDB_BASE_URL: undefined,
    LICHESS_BASE_URL: "lichessToken",
    POSIRA_BASE_URL: "posiraToken",
    CBM_BASE_URL: "chessboardMagicToken",
    DOJO_BASE_URL:"dojoToken"
}

export const SERVICE_CONFIG_API_TOKEN: Record<ExternalService, string | undefined> = {
    SF_BASE_URL: undefined,
    THEME_BASE_URL: undefined,
    UTIL_BASE_URL: undefined,
    BOARD_BASE_URL: undefined,
    NN_BASE_URL: undefined,
    CHESSDB_BASE_URL: undefined,
    LICHESS_BASE_URL: process.env.LICHESS_API_TOKEN ?? "",
    POSIRA_BASE_URL: process.env.POSIRA_API_KEY ?? "",
    CBM_BASE_URL: process.env.CHESSBOARD_MAGIC_PAT ?? "",
    DOJO_BASE_URL: process.env.DOJO_API_KEY ?? ""

}