import { McpServer } from "@modelcontextprotocol/server";
import { toolAdapter, toolContentAdapter, type ZodRawShapeCompat, type LegacyToolCallback } from "@jalpp/mcp-adapter";
import axios from "axios";
import type { RemoteAuthInfoExtra } from "./remoteAuth.js";

type RemoteHttpMethod = "GET" | "POST";

export interface RemoteHttpToolConfig<T extends ZodRawShapeCompat> {
  /** Unique tool name. */
  name: string;
  /** Description shown to the model. */
  description: string;
  /** Full endpoint URL. Supports `:paramName` path variable interpolation. */
  endpoint: string;
  /** HTTP method. */
  method: RemoteHttpMethod;
  /** Zod shape defining the tool's input arguments. */
  inputSchema?: T;
  /**
   * Name of the input arg that carries a fallback bearer token passed by the
   * LLM in conversation. Only used when no header credential is present.
   */
  tokenParam?: string;
  /**
   * Key into `extra.authInfo.extra` (see remoteAuth.ts's RemoteCredentials)
   * that holds this service's header-sourced credential, if the client sent
   * one. Takes priority over `tokenParam` when present.
   */
  headerCredKey: keyof RemoteAuthInfoExtra;
}

function resolvePathParams(endpoint: string, args: Record<string, unknown>) {
  const remaining: Record<string, unknown> = { ...args };
  const url = endpoint.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_match, key: string) => {
    if (key in remaining) {
      const value = remaining[key];
      delete remaining[key];
      return encodeURIComponent(String(value));
    }
    return `:${key}`;
  });
  return { url, remaining };
}

export function remoteHttpToolAdapter<T extends ZodRawShapeCompat>(
  server: McpServer,
  config: RemoteHttpToolConfig<T>
): void {
  const { name, description, endpoint, method, inputSchema, tokenParam, headerCredKey } = config;

  const cb = (async (args: Record<string, unknown> | undefined, ctx: unknown) => {
    const mutableArgs: Record<string, unknown> = { ...(args ?? {}) };

    // v2: the per-request auth info moved from v1's `extra.authInfo` to
    // `ctx.http?.authInfo` (see the SDK's v1-to-v2 migration guide).
    const authInfoExtra = (ctx as { http?: { authInfo?: { extra?: RemoteAuthInfoExtra } } } | undefined)
      ?.http?.authInfo?.extra;
    const headerToken = authInfoExtra?.[headerCredKey];

    let bearerToken: string | undefined =
      typeof headerToken === "string" && headerToken.length > 0 ? headerToken : undefined;

    if (!bearerToken && tokenParam) {
      const runtimeToken = mutableArgs[tokenParam];
      if (typeof runtimeToken === "string" && runtimeToken.length > 0) {
        bearerToken = runtimeToken;
      }
    }
    if (tokenParam) {
      delete mutableArgs[tokenParam];
    }

    const { url, remaining } = resolvePathParams(endpoint, mutableArgs);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

    try {
      const response = await axios({
        url,
        method,
        headers,
        ...(method === "GET" ? { params: remaining } : { data: remaining }),
      });
      return toolContentAdapter(response.data ?? {}, undefined);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? "unknown";
        const message = (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
        return toolContentAdapter({}, `HTTP ${status}: ${message}`);
      }
      return toolContentAdapter({}, `Unexpected error: ${String(err)}`);
    }
  }) as LegacyToolCallback<T>;

  if (inputSchema) {
    toolAdapter(server, {
      name,
      config: { description, inputSchema },
      cb,
    });
  } else {
    toolAdapter(server, {
      name,
      config: { description },
      cb: cb as LegacyToolCallback<undefined>,
    });
  }
}
