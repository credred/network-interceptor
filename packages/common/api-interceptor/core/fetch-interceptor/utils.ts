import { isNil } from "lodash";
import uid from "tiny-uid";
import { NetworkModifyInfo } from "../../../network-rule";
import { Header } from "../../../typings";
import { RequestInfo, ResponseInfo } from "../../types";
import { AdvancedRequestInfo } from "../../utils/RequestInfo";

const transformHeaders = (headers: HeadersInit) => {
  const result: Header[] = [];
  if (headers) {
    const internalHeaders = new Headers(headers);
    internalHeaders.forEach((value, key) => {
      result.push([key, value]);
    });
  }

  return result;
};

const transformRequestBody = (request: Request) => {
  if (isNil(request.body)) {
    return undefined;
  } else {
    return request.clone().text();
  }
};

const transformResponseBody = (oldResponse: Response) => {
  // body can only be used once. we should clone res
  const response = oldResponse.clone();
  const contentType = response.headers.get("Content-Type");
  let data = undefined;
  let parsable = true;
  if (contentType === null || contentType === undefined) {
    data = undefined;
  } else if (contentType.includes("json") || contentType.includes("text")) {
    data = response.text();
  } else {
    data = undefined;
    parsable = false;
  }

  return {
    data,
    parsable,
  };
};

export const generateRequestInfoByFetchRequest = async (
  request: Request
): Promise<AdvancedRequestInfo> => {
  return new AdvancedRequestInfo({
    id: uid(),
    type: "fetch",
    stage: "request",
    method: request.method,
    url: request.url,
    requestHeaders: transformHeaders(request.headers),
    requestBody: await transformRequestBody(request),
  });
};

export const generateResponseInfoByFetchResponse = async (
  response: Response,
  requestInfo: RequestInfo
): Promise<ResponseInfo> => {
  const { data, parsable } = transformResponseBody(response);
  return {
    ...requestInfo,
    stage: "response",
    status: response.status,
    statusText: response.statusText,
    responseHeaders: transformHeaders(response.headers),
    responseBody: await data,
    responseBodyParsable: parsable,
  };
};

export const generateResponseInfoByModifyInfo = (
  modifyInfo: NetworkModifyInfo["response"],
  requestInfo: RequestInfo
): ResponseInfo => {
  return {
    ...requestInfo,
    stage: "response",
    status: modifyInfo?.status || 200,
    statusText: modifyInfo?.statusText || "OK",
    responseBody: modifyInfo?.responseBody,
    responseBodyParsable: true,
    responseHeaders: modifyInfo?.responseHeaders,
  };
};
