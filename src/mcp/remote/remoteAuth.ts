

export const REMOTE_CRED_HEADERS = {
  lichess: "x-lichess-token",
  chessboardMagic: "x-chessboardmagic-token",
  posira: "x-posira-token",
  dojo: "x-dojo-token",
} as const;

export interface RemoteCredentials {
  lichessToken?: string;
  chessboardMagicToken?: string;
  posiraToken?: string;
  dojoToken?: string;
}

type HeaderLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

function readHeader(headers: HeaderLike, name: string): string | undefined {
  if (!headers) return undefined;

  if (typeof (headers as Headers).get === "function") {
    const value = (headers as Headers).get(name);
    return value ?? undefined;
  }

  const value = (headers as Record<string, string | string[] | undefined>)[
    name.toLowerCase()
  ];
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}


export function extractRemoteCredentials(headers: HeaderLike): RemoteCredentials {
  return {
    lichessToken: readHeader(headers, REMOTE_CRED_HEADERS.lichess),
    chessboardMagicToken: readHeader(headers, REMOTE_CRED_HEADERS.chessboardMagic),
    posiraToken: readHeader(headers, REMOTE_CRED_HEADERS.posira),
    dojoToken: readHeader(headers, REMOTE_CRED_HEADERS.dojo),
  };
}


export type RemoteAuthInfoExtra = RemoteCredentials;
