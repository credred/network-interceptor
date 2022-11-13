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
  origin?: string;
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
  id: string;
  /**
   * @default false
   */
  baseMatchRule: NetworkBaseMatchRule;
  advanceMatchRules: NetworkAdvanceMatchRule[];
  modifyInfo: NetworkModifyInfo;
}
