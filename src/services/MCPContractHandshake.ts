import { McpServer } from "@modelcontextprotocol/server";
import { APIContract } from "./contract.js";
import {
  deleteToolAdapter,
  getToolAdapter,
  postToolAdapter,
} from "@jalpp/mcp-adapter";
import { remoteHttpToolAdapter } from "../mcp/remote/remoteHttpToolAdapter.js";

export class MCPContractHandshakeStrategy {
  private McpServer: McpServer;
  private contracts: APIContract[];
  private enableRemoteEnv: boolean;

  constructor(
    mcpServer: McpServer,
    handShakeContracts: APIContract[],
    enableRemote: boolean,
  ) {
    this.McpServer = mcpServer;
    this.contracts = handShakeContracts;
    this.enableRemoteEnv = enableRemote;
  }

  public applyBulkContracts() {
    for (let i = 0; i < this.contracts.length; i++) {
      this.applyContracts(this.contracts[i]);
    }
  }

  private applyContracts(contract: APIContract) {
    const getContracts = contract.getContracts();
    const getContractsSize = getContracts.length;
    const postContracts = contract.postContracts();
    const postContractsSize = postContracts.length;
    const deleteContracts = contract.deleteContracts();
    const deleteContractsSize = deleteContracts.length;
    const remoteContracts = contract.getMethodRemoteContracts();
    const remoteCOntractsSize = remoteContracts.length;

    if (remoteCOntractsSize > 1 && this.enableRemoteEnv) {
      for (let i = 0; i < remoteCOntractsSize; i++) {
        remoteHttpToolAdapter(this.McpServer, remoteContracts[i]);
      }
    } else if (getContractsSize > 1) {
      for (let i = 0; i < getContractsSize; i++) {
        getToolAdapter(this.McpServer, getContracts[i]);
      }
    }

    if (postContractsSize > 1) {
      for (let i = 0; i < postContractsSize; i++) {
        postToolAdapter(this.McpServer, postContracts[i]);
      }
    }

    if (deleteContractsSize > 1) {
      for (let i = 0; i < deleteContractsSize; i++) {
        deleteToolAdapter(this.McpServer, deleteContracts[i]);
      }
    }
  }
}
