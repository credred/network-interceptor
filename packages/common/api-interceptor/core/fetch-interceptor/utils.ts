import { isNil, isPlainObject, isString, upperFirst } from "lodash";
import uid from "tiny-uid";
import { NetworkModifyInfo } from "../../../network-rule";
import { BLOB_TEXT } from "../../constants";
import { RequestInfo, ResponseInfo } from "../../types";

const transformHeaders = (headers?: HeadersInit) => {
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

const generateOriginProp = <
  T extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends Partial<Record<T, any>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O extends Partial<Record<T, any>>
>(
  originObj: R,
  obj: O,
  propName: T
): Record<T | `origin${Capitalize<T>}`, R[T]> | undefined => {
  if (obj[propName]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      [propName]: obj[propName],
      [`origin${upperFirst(propName)}`]: originObj[propName],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
};

export const applyModifyInfoToRequestInfo = (
  requestInfo: RequestInfo,
  modifyInfo?: NetworkModifyInfo["request"],
  ruleId?: string
): RequestInfo => {
  if (ruleId) {
    requestInfo = { ...requestInfo, ruleId };
  }
  if (modifyInfo) {
    return {
      ...requestInfo,
      ...generateOriginProp(requestInfo, modifyInfo, "requestHeaders"),
      ...generateOriginProp(requestInfo, modifyInfo, "requestBody"),
    };
  }

  return requestInfo;
};

export const applyModifyInfoToResponseInfo = (
  responseInfo: ResponseInfo,
  modifyInfo?: NetworkModifyInfo["response"]
): ResponseInfo => {
  if (modifyInfo) {
    return {
      ...responseInfo,
      ...generateOriginProp(responseInfo, modifyInfo, "responseHeaders"),
      ...generateOriginProp(responseInfo, modifyInfo, "responseBody"),
    };
  }

  return responseInfo;
};
