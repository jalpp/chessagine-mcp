import { McpServer } from "@modelcontextprotocol/server";
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
} from "../../runner/schema.js";
import { SERVICE_CONFIG_BASE_URL_MAP } from "../../services/config.js";
import { remoteHttpToolAdapter } from "./remoteHttpToolAdapter.js";

const BASE_URL = SERVICE_CONFIG_BASE_URL_MAP.DOJO_BASE_URL;

export function registerDojoToolsRemote(server: McpServer): void {

  remoteHttpToolAdapter(server, {
    name: "get-dojo-pat-user",
    description: "Fetch the ChessDojo training plan user tied to the caller's Personal Access Token (PAT), including their cohort and progress.",
    endpoint: `${BASE_URL}/pat/user`,
    method: "GET",
    inputSchema: { token: tokenSchema },
    tokenParam: "token",
    headerCredKey: "dojoToken",
  });

  remoteHttpToolAdapter(server, {
    name: "get-dojo-requirements",
    description: "Fetch ChessDojo training plan requirements for a given cohort.",
    endpoint: `${BASE_URL}/pat/requirements/:cohort`,
    method: "GET",
    inputSchema: {
      cohort: dojoCohortSchema,
      scoreboardOnly: dojoScoreboardOnlySchema,
      token: tokenSchema,
    },
    tokenParam: "token",
    headerCredKey: "dojoToken",
  });

  remoteHttpToolAdapter(server, {
    name: "update-dojo-progress",
    description: "Update the caller's progress on a ChessDojo training plan requirement (marks task progress, e.g. after finishing a puzzle or study session).",
    endpoint: `${BASE_URL}/pat/user/progress/v3`,
    method: "POST",
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
    headerCredKey: "dojoToken",
  });
}
