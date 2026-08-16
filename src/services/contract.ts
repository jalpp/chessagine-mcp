import { DeleteToolAdapterConfig, GetToolAdapterConfig, PostToolAdapterConfig } from "@jalpp/mcp-adapter";
import { RemoteHttpToolConfig } from "../mcp/remote/remoteHttpToolAdapter.js";

export interface APIContract {

    getContracts(): GetToolAdapterConfig<{}>[];

    postContracts(): PostToolAdapterConfig<{}>[]

    deleteContracts(): DeleteToolAdapterConfig<{}>[];

    getMethodRemoteContracts(): RemoteHttpToolConfig<{}>[];

    isRemoteEnvContract(): boolean;

}