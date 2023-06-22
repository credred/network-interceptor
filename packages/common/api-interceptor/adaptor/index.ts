import uid from "tiny-uid";
import { NetworkRule } from "../../network-rule";
import { assertNonNil, delay } from "../../utils";
import { PowerRequest, PowerResponse } from "../core/base";
import { createInterceptedFetch } from "../core/fetch-interceptor";
import { InterceptorConfig } from "../core/types";
import { createInterceptedXhr } from "../core/xhr-interceptor";
import { RequestInfo, ResponseInfo } from "../types";
import { parseRequestBody, parseResponseBody } from "./parseStream";

export interface AdaptorConfig {
  matchRule: (request: RequestInfo) => Promise<NetworkRule | undefined>;
  requestWillBeSent: (request: RequestInfo) => void;
  responseReceived: (responseInfo: ResponseInfo) => void;
  onError?: (err: unknown) => void;
}

type Ctx = {
  requestId: string;
  type: RequestInfo["type"];
  rule?: NetworkRule;
  requestInfo?: RequestInfo;
};

const serializePowerRequest = async (
  powerRequest: PowerRequest<Ctx>
): Promise<RequestInfo> => {
  return {
    id: powerRequest.ctx.requestId,
    ruleId: powerRequest.ctx.rule?.id,
    type: powerRequest.ctx.type,
    stage: "request",
    url: powerRequest.request.url,
    method: powerRequest.request.method,
    requestHeaders: Array.from(powerRequest.request.headers.entries()),
    requestBody: await parseRequestBody(powerRequest.request.clone()),
  };
};
const serializePowerResponse = async (
  powerRequest: PowerRequest<Ctx>,
  powerResponse: PowerResponse
): Promise<ResponseInfo> => {
  assertNonNil(powerRequest.ctx.requestInfo);
  return {
    ...powerRequest.ctx.requestInfo,
    stage: "response",
    ...(await parseResponseBody(powerResponse.response.clone())),
    status: powerResponse.response.status,
    statusText: powerResponse.response.statusText,
    responseHeaders: Array.from(powerResponse.response.headers.entries()),
  };
};

const transformConfig = (
  config: AdaptorConfig,
  type: RequestInfo["type"]
): InterceptorConfig<Ctx> => {
  return {
    async onRequest(powerRequest) {
      const rule = await config.matchRule(
        await serializePowerRequest(powerRequest)
      );
      powerRequest.ctx.rule = rule;
      if (rule?.modifyInfo.request) {
        const requestModifyInfo = rule.modifyInfo.request;
        powerRequest.modify({
          url: requestModifyInfo.redirectUrl,
          body: requestModifyInfo.requestBody,
          headers: requestModifyInfo.requestHeaders,
        });
      }
      powerRequest.ctx.requestInfo = await serializePowerRequest(powerRequest);
      void config.requestWillBeSent(powerRequest.ctx.requestInfo);
      if (rule?.modifyInfo.response) {
        const responseModifyInfo = rule.modifyInfo.response;
        return new PowerResponse(responseModifyInfo?.responseBody, {
          headers: responseModifyInfo?.responseHeaders,
          status: responseModifyInfo?.status,
          statusText: responseModifyInfo?.statusText,
        });
      }
    },
    async onResponse(powerRequest, powerResponse) {
      const rule = powerRequest.ctx.rule;
      if (rule?.modifyInfo?.continueRequest) {
        const responseModifyInfo = rule.modifyInfo.response;
        // the response needs to be modified only after the request was previously continued
        powerResponse.modify({
          body: responseModifyInfo?.responseBody,
          headers: responseModifyInfo?.responseHeaders,
          status: responseModifyInfo?.status,
          statusText: responseModifyInfo?.statusText,
        });
      }
      const responseModifyInfo = powerRequest.ctx.rule?.modifyInfo.response;
      if (responseModifyInfo) {
        await delay(responseModifyInfo.delay);
      }
      void config.responseReceived(
        await serializePowerResponse(powerRequest, powerResponse)
      );
    },
    onError(powerRequest, err) {
      assertNonNil(powerRequest.ctx.requestInfo);
      void config.responseReceived({
        ...powerRequest.ctx.requestInfo,
        stage: "response",
        status: 0,
        statusText: "(failed)",
        responseBody: "",
        isBase64: false,
      });
    },
    createCtx() {
      return { requestId: uid(), type };
    },
  };
};

export const createFetch = (pureFetch: typeof fetch, config: AdaptorConfig) => {
  return createInterceptedFetch(pureFetch, transformConfig(config, "fetch"));
};
export const createXhr = (
  PureXMLHttpRequest: typeof XMLHttpRequest,
  config: AdaptorConfig
) => createInterceptedXhr(PureXMLHttpRequest, transformConfig(config, "xhr"));
