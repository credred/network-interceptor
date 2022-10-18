import { isNil, isPlainObject, isString } from "lodash";
import uid from "tiny-uid";
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
  const contentType = res.headers.get("Content-Type");
  let data = undefined;
  let parsable = true;
  if (contentType === null || contentType === undefined) {
    data = undefined;
  } else if (contentType.includes("json") || contentType.includes("text")) {
    data = res.text();
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

  networkEmitter.emit("request", requestInfo);

  const res = await originFetch(input, init);

  const { data, parsable } = transformResponseData(res);

  void Promise.resolve(data).then((data) => {
    const responseInfo: ResponseInfo = {
      ...requestInfo,
      stage: 'response',
      status: res.status,
      statusText: res.statusText,
      responseHeaders: transformHeaders(res.headers),
      responseBody: data,
      responseBodyParsable: parsable,
    };
    return networkEmitter.emit("response", responseInfo);
  });

  return res;
}
