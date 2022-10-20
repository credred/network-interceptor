import { isNil, isPlainObject, isString } from "lodash";
import uid from "tiny-uid";
import { matchRule } from "../../network-rule";
import { BLOB_TEXT } from "../constants";
import { RequestInfo, ResponseInfo } from "../types";
import { networkEmitter } from "./event-emitter";

const originFetch = fetch;

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

const transformBody = (body?: BodyInit | null) => {
  if (isNil(body)) {
    return undefined;
  } else if (isString(body)) {
    return body;
  }
  return BLOB_TEXT;
};

const transformResponseData = (res: Response) => {
  // body can only be used once. we should clone res
  const resCloned = res.clone();
  const contentType = resCloned.headers.get("Content-Type");
  let data = undefined;
  let parsable = true;
  if (contentType === null || contentType === undefined) {
    data = undefined;
  } else if (contentType.includes("json") || contentType.includes("text")) {
    data = resCloned.text();
  } else {
    data = undefined;
    parsable = false;
  }

  return {
    data,
    parsable,
  };
};

export async function InterceptedFetch(
  input: Request | string | URL,
  init?: RequestInit
) {
  let url: string | URL;
  let option = init;
  if (input instanceof Request) {
    url = input.url;
    option = input;
  } else {
    url = input;
  }

  const requestInfo: RequestInfo = {
    id: uid(),
    type: "fetch",
    stage: "request",
    method: option?.method?.toUpperCase() || "GET",
    url: new URL(url, location.href).toString(),
    requestHeaders: transformHeaders(option?.headers),
    requestBody: transformBody(option?.body),
  };

  const rule = matchRule(requestInfo);
  const networkModifyInfo = rule?.modifyInfo;
  requestInfo.ruleId = rule?.id;

  if (networkModifyInfo) {
    init = init || {};
    const { requestBody, requestHeaders } = networkModifyInfo;
    if (requestBody) {
      init.body = requestBody;
      requestInfo.requestBody = requestBody;
    }
    if (requestHeaders) {
      init.headers = requestHeaders;
      requestInfo.requestHeaders = requestHeaders;
    }
  }

  networkEmitter.emit("request", requestInfo);

  let finalResponse: Response;
  if (!networkModifyInfo) {
    // not match rule, fetch target directly
    finalResponse = await originFetch(input, init);
  } else if (!networkModifyInfo.continueRequest) {
    // continue fetch network. modify response
    const res = await originFetch(input, init);
    const { status, statusText, responseBody, responseHeaders } =
      networkModifyInfo;

    finalResponse = new Response(responseBody ?? res.body, {
      headers: responseHeaders,
      status,
      statusText,
    });
  } else {
    // skip fetch network. response directly
    const { responseBody, responseHeaders, status, statusText } =
      networkModifyInfo;
    finalResponse = new Response(responseBody, {
      headers: responseHeaders,
      status,
      statusText,
    });
  }

  const { data, parsable } = transformResponseData(finalResponse);

  void Promise.resolve(data).then((data) => {
    const responseInfo: ResponseInfo = {
      ...requestInfo,
      stage: "response",
      status: finalResponse.status,
      statusText: finalResponse.statusText,
      responseHeaders: transformHeaders(finalResponse.headers),
      responseBody: data,
      responseBodyParsable: parsable,
    };

    networkEmitter.emit("response", responseInfo);
  });

  return finalResponse;
}
