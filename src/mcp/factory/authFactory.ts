import {
  ExternalService,
  SERVICE_CONFIG_API_TOKEN,
  SERVICE_CONFIG_BASE_URL_MAP,
  SERVICE_CONFIG_REMOTE_API_HEADER_KEY,
} from "../../services/config.js";

type tokenType = "bearer";

type authType = { type: tokenType; token: string };

export interface AuthServiceConfig {
  baseUrl: string;
  staticAuth: authType;
  headerKey?: string;
}

export function getAuthServiceFactory(
  serviceType: ExternalService,
): AuthServiceConfig {
  const authSeviceType: authType = {
    type: "bearer",
    token: SERVICE_CONFIG_API_TOKEN[serviceType] ?? "",
  };

  return {
    baseUrl: SERVICE_CONFIG_BASE_URL_MAP[serviceType],
    staticAuth: authSeviceType,
    headerKey: SERVICE_CONFIG_REMOTE_API_HEADER_KEY[serviceType]
  };
}
