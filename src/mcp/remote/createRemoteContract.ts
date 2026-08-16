import {
  GetToolAdapterConfig,
  PostToolAdapterConfig,
} from "@jalpp/mcp-adapter";
import {
  RemoteHttpMethod,
  RemoteHttpToolConfig,
} from "./remoteHttpToolAdapter.js";
import { RemoteCredentials } from "./remoteAuth.js";
import { AuthServiceConfig } from "../factory/authFactory.js";

export function setRemoteContract(
  localContracts: GetToolAdapterConfig<{}>[] | PostToolAdapterConfig<{}>[],
  remoteContracts: RemoteHttpToolConfig<{}>[],
  method: RemoteHttpMethod,
  authConfig: AuthServiceConfig,
) {
  for (let i = 0; i < localContracts.length; i++) {
    if (localContracts[i].tokenParam === "token") {
      const remoteContract = {
        ...localContracts[i],
        method: method,
        headerCredKey: authConfig.headerKey as keyof RemoteCredentials,
      };
      remoteContracts.push(remoteContract);
    }
  }

}
