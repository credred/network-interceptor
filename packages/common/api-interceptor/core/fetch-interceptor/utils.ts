import { isNil, isPlainObject } from "lodash";
import uid from "tiny-uid";
import { NetworkModifyInfo } from "../../../network-rule";
import { RequestInfo, ResponseInfo } from "../../types";

const transformHeaders = (headers: HeadersInit) => {
  let headerObj: Record<string, string> | undefined;
  if (!headers) {
    headerObj = undefined;
  } else if (isPlainObject(headers)) {
    headerObj = headers as Record<string, string>;
  } else {
    const internalHeaders = new Headers(headers);
    const internalHeaderObj: Record<string, string> = {};
    internalHeaders.forEach((value, key) => {
      internalHeaderObj[key] = value;
    });
    headerObj = internalHeaderObj;
  }

  return headerObj;
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
): Promise<RequestInfo> => {
  return {
    id: uid(),
    type: "fetch",
    stage: "request",
    method: request.method,
    url: request.url,
    requestHeaders: transformHeaders(request.headers),
    requestBody: await transformRequestBody(request),
  };
};

export const generateResponseInfoByFetchResponse = async (
  response: Response,
  id: string
): Promise<ResponseInfo> => {
  const { data, parsable } = transformResponseBody(response);
  return {
    id,
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
  id: string
): ResponseInfo => {
  return {
    id,
    stage: "response",
    status: modifyInfo?.status || 200,
    statusText: modifyInfo?.statusText || "OK",
    responseBody: modifyInfo?.responseBody,
    responseBodyParsable: true,
    responseHeaders: modifyInfo?.responseHeaders,
  };
};
