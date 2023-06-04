import { NetworkRule } from "../network-rule";
import { Header } from "../typings";

export interface RequestInfo {
  id: string;
  /** matched rule id */
  ruleId?: string;
  type: "xhr" | "fetch";
  stage: "request";
  url: string;
  method: string;
  requestHeaders?: Header[];
  requestBody?: string;
  originRequestHeaders?: Header[];
  originRequestBody?: string;
}

export interface ResponseInfo extends Omit<RequestInfo, "stage"> {
  id: string;
  stage: "response";
  status: number;
  statusText: string;
  responseHeaders?: Header[];
  responseBody?: string;
  responseBodyParsable: boolean;
  originResponseHeaders?: Header[];
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
