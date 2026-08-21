import { McpServer } from "@modelcontextprotocol/server";
import { APIContract } from "./contract.js";
import {
  deleteToolAdapter,
  getToolAdapter,
  postToolAdapter,
} from "@jalpp/mcp-adapter";

export class MCPContractHandshakeStrategy {
  private McpServer: McpServer;
  private contracts: APIContract[];

  constructor(mcpServer: McpServer, handShakeContracts: APIContract[]) {
    this.McpServer = mcpServer;
    this.contracts = handShakeContracts;
  }

  public performApiContractsHandshakes() {
    for (let i = 0; i < this.contracts.length; i++) {
      this.performHandshake(this.contracts[i]);
    }
  }

  private performHandshake(contract: APIContract) {
    const getContracts = contract.getContracts();
    const getContractsSize = getContracts.length;
    const postContracts = contract.postContracts();
    const postContractsSize = postContracts.length;
    const deleteContracts = contract.deleteContracts();
    const deleteContractsSize = deleteContracts.length;

    if (getContractsSize >= 1) {
      for (let i = 0; i < getContractsSize; i++) {
        getToolAdapter(this.McpServer, getContracts[i]);
      }
    }

    if (postContractsSize >= 1) {
      for (let i = 0; i < postContractsSize; i++) {
        postToolAdapter(this.McpServer, postContracts[i]);
      }
    }

    if (deleteContractsSize >= 1) {
      for (let i = 0; i < deleteContractsSize; i++) {
        deleteToolAdapter(this.McpServer, deleteContracts[i]);
      }
    }
  }
}
