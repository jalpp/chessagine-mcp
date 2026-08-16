import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import { APIContract } from "./contract.js";
import { API } from "./Api.js";
import {
  cbmGameIdSchema,
  cbmRepIdSchema,
  fenSchema,
  tokenSchema,
} from "../runner/schema.js";
import { RemoteHttpMethod, RemoteHttpToolConfig } from "../mcp/remote/remoteHttpToolAdapter.js";
import { RemoteCredentials } from "../mcp/remote/remoteAuth.js";

export class ChessBoardMagicApiContract extends API implements APIContract {
  constructor() {
    super("CBM_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const staticAuth = factory.staticAuth;

    const contracts: GetToolAdapterConfig<{}>[] = [
      {
        name: "get-chessboardmagic-repertoires",
        description:
          "Fetch user's chess repertoires from the Chessboard Magic Repertoire Builder",
        endpoint: `${BASE_URL}/mcp/repertoires`,
        inputSchema: { token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-games",
        description:
          "Fetch user's chess games from the Chessboard Magic Repertoire Builder",
        endpoint: `${BASE_URL}/mcp/games`,
        inputSchema: { token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-tcec-stats",
        description:
          "Fetch TCEC (Top Chess Engine Championship) statistics for a specific chess position",
        endpoint: `${BASE_URL}/mcp/tcec/stats`,
        inputSchema: { fen: fenSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-tcec-games",
        description: "Fetch TCEC games that reached a specific chess position",
        endpoint: `${BASE_URL}/mcp/tcec/games`,
        inputSchema: { fen: fenSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-corr-stats",
        description:
          "Fetch correspondence chess statistics for a specific chess position",
        endpoint: `${BASE_URL}/mcp/corr/stats`,
        inputSchema: { fen: fenSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-corr-games",
        description:
          "Fetch correspondence chess games that reached a specific chess position",
        endpoint: `${BASE_URL}/mcp/corr/games`,
        inputSchema: { fen: fenSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-game-details",
        description:
          "Fetch user's single game's metadata, moves, tags, variations and comment links",
        endpoint: `${BASE_URL}/mcp/games/:gameId`,
        inputSchema: { gameId: cbmGameIdSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-chessboardmagic-repertoire-details",
        description:
          "Fetch user's single repertoire metadata, moves, variations and comment links",
        endpoint: `${BASE_URL}/mcp/repertoires/:repertoireId`,
        inputSchema: { repertoireId: cbmRepIdSchema, token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
    ];

    return contracts;
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    return [];
  }

  deleteContracts(): DeleteToolAdapterConfig<{}>[] {
    return [];
  }

  getMethodRemoteContracts(): RemoteHttpToolConfig<{}>[] {
    const localContracts = this.getContracts();
    const remoteContracts: RemoteHttpToolConfig<{}>[] = [];

    for(let i = 0; i < localContracts.length; i++) {
      if(localContracts[i].tokenParam === "token"){
        const remoteContract = {
          ...localContracts[i],
          method: "GET" as RemoteHttpMethod,
          headerCredKey: this.getAuthServiceConfig().headerKey as keyof RemoteCredentials
        }
        remoteContracts.push(remoteContract);
      }
    }

    return remoteContracts;
  }

  isRemoteEnvContract(): boolean {
    return this.getRemoteHeaderSupported();
  }

  
}
