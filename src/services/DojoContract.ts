import { API } from "./Api.js";
import { APIContract } from "./contract.js";
import {
  DeleteToolAdapterConfig,
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import {
  dojoCohortSchema,
  dojoDateSchema,
  dojoIncrementalMinutesSpentSchema,
  dojoNewCountSchema,
  dojoNotesSchema,
  dojoPreviousCountSchema,
  dojoRequirementIdSchema,
  dojoScoreboardOnlySchema,
  tokenSchema,
} from "../runner/schema.js";
import {
  RemoteHttpMethod,
  RemoteHttpToolConfig,
} from "../mcp/remote/remoteHttpToolAdapter.js";
import { RemoteCredentials } from "../mcp/remote/remoteAuth.js";
import { setRemoteContract } from "../mcp/remote/createRemoteContract.js";

export class ChessDojoApiContract extends API implements APIContract {
  constructor() {
    super("DOJO_BASE_URL");
  }

  getContracts(): GetToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const staticAuth = factory.staticAuth;

    const contracts: GetToolAdapterConfig<{}>[] = [
      {
        name: "get-dojo-pat-user",
        description:
          "Fetch the ChessDojo training plan user tied to the caller's Personal Access Token (PAT), including their cohort and progress.",
        endpoint: `${BASE_URL}/pat/user`,
        inputSchema: { token: tokenSchema },
        tokenParam: "token",
        auth: staticAuth,
      },
      {
        name: "get-dojo-requirements",
        description:
          "Fetch ChessDojo training plan requirements for a given cohort.",
        endpoint: `${BASE_URL}/pat/requirements/:cohort`,
        inputSchema: {
          cohort: dojoCohortSchema,
          scoreboardOnly: dojoScoreboardOnlySchema,
          token: tokenSchema,
        },
        tokenParam: "token",
        auth: staticAuth,
      },
    ];

    return contracts;
  }

  postContracts(): PostToolAdapterConfig<{}>[] {
    const factory = this.getAuthServiceConfig();

    const BASE_URL = factory.baseUrl;

    const staticAuth = factory.staticAuth;

    return [
      {
        name: "update-dojo-progress",
        description:
          "Update the caller's progress on a ChessDojo training plan requirement (marks task progress, e.g. after finishing a puzzle or study session).",
        endpoint: `${BASE_URL}/pat/user/progress/v3`,
        inputSchema: {
          requirementId: dojoRequirementIdSchema,
          cohort: dojoCohortSchema,
          previousCount: dojoPreviousCountSchema,
          newCount: dojoNewCountSchema,
          incrementalMinutesSpent: dojoIncrementalMinutesSpentSchema,
          date: dojoDateSchema,
          notes: dojoNotesSchema,
          token: tokenSchema,
        },
        tokenParam: "token",
        auth: staticAuth,
      },
    ];
  }

  deleteContracts(): DeleteToolAdapterConfig<{}>[] {
    return [];
  }

  getMethodRemoteContracts(): RemoteHttpToolConfig<{}>[] {
    const localContracts = this.getContracts();
    const remoteContracts: RemoteHttpToolConfig<{}>[] = [];
    const authServiceConfig = this.getAuthServiceConfig();

    setRemoteContract(
      localContracts,
      remoteContracts,
      "GET",
      authServiceConfig,
    );

    const postContracts = this.postContracts();

    setRemoteContract(
      postContracts,
      remoteContracts,
      "POST",
      authServiceConfig,
    );

    return remoteContracts;
  }

  isRemoteEnvContract(): boolean {
    return this.getRemoteHeaderSupported();
  }
}
