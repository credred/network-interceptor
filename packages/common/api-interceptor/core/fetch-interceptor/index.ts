import {
  NetworkModifyInfo,
  shouldContinueRequest,
} from "../../../network-rule";
import {
  MatchRule,
  RequestWillBeSent,
  ResponseInfo,
  ResponseReceived,
} from "../../types";
import {
  applyModifyInfoToRequestInfo,
  applyModifyInfoToResponseInfo,
  generateRequestInfoByFetchOption,
  generateResponseInfoByFetchResponse,
  generateResponseInfoByModifyInfo,
} from "./utils";

const generateFetchOptionsByModifyInfo = (
  requestModifyInfo: NetworkModifyInfo["request"],
  input: Request | string | URL,
  init?: RequestInit
) => {
  if (requestModifyInfo) {
    const { requestBody, requestHeaders } = requestModifyInfo;
    init = init || {};
    if (requestBody) {
      init.body = requestBody;
    }
    if (requestHeaders) {
      init.headers = requestHeaders;
    }
  }

  return [input, init] as const;
};

const generateFetchResponseByModifyInfo = (
  responseModifyInfo: NetworkModifyInfo["response"],
  oldResponse?: Response
) => {
  let response = oldResponse;
  if (responseModifyInfo) {
    const { status, statusText, responseBody, responseHeaders } =
      responseModifyInfo;
    response = new Response(responseBody ?? oldResponse?.body, {
      headers: responseHeaders || oldResponse?.headers,
      status,
      statusText,
    });
  }

  return response;
};

export const createInterceptedFetch = (
  originFetch: typeof fetch,
  callback: {
    matchRule: MatchRule;
    requestWillBeSent: RequestWillBeSent;
    responseReceived: ResponseReceived;
  }
) => {
  async function interceptedFetch(
    input: Request | string | URL,
    init?: RequestInit
  ): Promise<Response> {
    const originRequestInfo = generateRequestInfoByFetchOption(input, init);
    const requestId = originRequestInfo.id;
    const rule = await callback.matchRule(originRequestInfo);
    const networkModifyInfo = rule?.modifyInfo;
    const requestInfo = applyModifyInfoToRequestInfo(
      originRequestInfo,
      networkModifyInfo?.request,
      rule?.id,
    );
    callback.requestWillBeSent(requestInfo);

    [input, init] = generateFetchOptionsByModifyInfo(
      networkModifyInfo?.request,
      input,
      init
    );

    let response: Response | undefined = undefined;
    let responseInfo: ResponseInfo;
    if (shouldContinueRequest(networkModifyInfo)) {
      response = await originFetch(input, init);
      const originResponseInfo = await generateResponseInfoByFetchResponse(
        response,
        requestId
      );
      responseInfo = applyModifyInfoToResponseInfo(
        originResponseInfo,
        networkModifyInfo?.response
      );
    } else {
      // networkModifyInfo must not be undefined
      responseInfo = generateResponseInfoByModifyInfo(
        networkModifyInfo!.response,
        requestId
      );
    }
    callback.responseReceived(responseInfo);
    // one of response or networkModifyInfo must not be undefined
    response = generateFetchResponseByModifyInfo(networkModifyInfo?.response, response)!;

    return response;
  }

  return interceptedFetch;
};
