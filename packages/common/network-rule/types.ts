import { Header } from "../typings";

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
    requestHeaders?: Header[];
  };
  response?: {
    status?: number;
    statusText?: string;
    delay?: number;
    responseHeaders?: Header[];
    responseBody?: string;
  };
}

export interface NetworkRule {
  id: string;
  /**
   * @default false
   */
  ruleName?: string;
  disabled?: boolean;
  baseMatchRule: NetworkBaseMatchRule;
  advanceMatchRules: NetworkAdvanceMatchRule[];
  modifyInfo: NetworkModifyInfo;
}
