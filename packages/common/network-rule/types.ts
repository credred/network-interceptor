export interface NetworkAdvanceMatchRule {
  type:
    | "requestBody"
    | "responseBody"
    | "query"
    | "routeParam"
    | "requestHeader"
    | "responseHead";
  invert: boolean;
  key: string;
  value: string;
}

export interface NetworkBaseMatchRule {
  method: string;
  protocol?: "http" | "https";
  host?: string;
  path: string;
}

export interface NetworkModifyInfo {
  continueRequest?: boolean;
  request?: {
    redirectUrl?: string;
    requestBody?: string;
    requestHeaders?: Record<string, string>;
  };
  response?: {
    status?: number;
    statusText?: string;
    responseHeaders?: Record<string, string>;
    responseBody?: string;
  };
}

export interface NetworkRule {
  version: 1;
  id: string;
  /**
   * @default false
   */
  baseMatchRule: NetworkBaseMatchRule;
  advanceMatchRules: NetworkAdvanceMatchRule[];
  modifyInfo: NetworkModifyInfo;
}
