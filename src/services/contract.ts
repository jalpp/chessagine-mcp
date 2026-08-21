import { DeleteToolAdapterConfig, GetToolAdapterConfig, PostToolAdapterConfig } from "@jalpp/mcp-adapter";

export interface APIContract {

    getContracts(): GetToolAdapterConfig<{}>[];

    postContracts(): PostToolAdapterConfig<{}>[]

    deleteContracts(): DeleteToolAdapterConfig<{}>[];

}