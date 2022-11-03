import { NetworkRule } from "../network-rule";

export interface RequestInfo {
  id: string;
  /** matched rule id */
  ruleId?: string;
  type: "xhr" | "fetch";
  stage: "request";
  url: string;
  method: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  originRequestHeaders?: Record<string, string>;
  originRequestBody?: string;
}

export interface ResponseInfo {
  id: string;
  stage: "response";
  status: number;
  statusText: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  responseBodyParsable: boolean;
  originResponseHeaders?: Record<string, string>;
  originResponseBody?: string;
}

export type NetworkInfo = Omit<RequestInfo, "stage"> &
  Partial<Omit<ResponseInfo, "stage">> & {
    stage: "request" | "response";
  };

export type StrongNetworkInfo = RequestInfo | ResponseInfo;

export type MatchRule = (
  requestInfo: RequestInfo
) => Promise<NetworkRule | undefined>;
export type RequestWillBeSent = (requestInfo: RequestInfo) => void;
export type ResponseReceived = (responseInfo: ResponseInfo) => void;

export interface InterceptorConfig {
  matchRule: MatchRule;
  requestWillBeSent: RequestWillBeSent;
  responseReceived: ResponseReceived;
}
