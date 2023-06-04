import { Header } from "../../typings";
import { RequestInfo } from "../types";

export type SerializedRequestInfo = RequestInfo;

export interface RawRequestInfo {
  id: string;
  /** matched rule id */
  ruleId?: string;
  type: "xhr" | "fetch";
  stage: "request";
  url: string;
  method: string;
  requestHeaders?: HeadersInit;
  requestBody?: string;
  originRequestHeaders?: HeadersInit;
  originRequestBody?: string;
}

export class AdvancedRequestInfo {
  id: string;
  /** matched rule id */
  ruleId?: string;
  type: "xhr" | "fetch";
  stage: "request";
  url: string;
  method: string;
  requestHeaders?: Headers;
  requestBody?: string;
  originRequestHeaders?: Header[];
  originRequestBody?: string;

  constructor(options: RawRequestInfo) {
    this.id = options.id;
    this.ruleId = options.ruleId;
    this.type = options.type;
    this.stage = options.stage;
    this.url = options.url;
    this.method = options.method;
    this.requestHeaders = new Headers(options.requestHeaders);
    this.requestBody = options.requestBody;
    this.originRequestHeaders = Array.isArray(options.originRequestHeaders)
      ? options.originRequestHeaders
      : Array.from(new Headers(options.originRequestHeaders));
    this.originRequestBody = options.originRequestBody;
  }

  copy(options: Partial<RawRequestInfo>) {
    return new AdvancedRequestInfo({
      ...this,
      ...options,
      requestHeaders: options.requestHeaders || this.getRawHeader(),
    });
  }

  getRawHeader() {
    return this.requestHeaders
      ? Array.from(this.requestHeaders.entries())
      : undefined;
  }

  serialize(): SerializedRequestInfo {
    return {
      ...this,
      requestHeaders: this.getRawHeader(),
    };
  }
}

export class ApiResponseInfo {}
