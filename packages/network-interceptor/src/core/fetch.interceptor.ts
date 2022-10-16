import { isNil, isPlainObject, isString } from "lodash";
import uid from "tiny-uid";
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
  return "-- blob --";
};

const transformResponseData = (res: Response) => {
  const contentType = res.headers.get("Content-Type");
  if (contentType === null || contentType === undefined) {
    return undefined;
  } else if (contentType.includes("json")) {
    return res.json() as object;
  } else if (contentType.includes("text")) {
    return res.text();
  } else {
    return "-- blob --";
  }
};

export async function InterceptedFetch(
  input: RequestInfo | URL,
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

  const id = uid();

  networkEmitter.emit(
    "request",
    {
      id: id,
      type: "fetch",
      method: option?.method?.toUpperCase() || "GET",
      url: new URL(url, location.href).toString(),
      requestHeaders: transformHeaders(option?.headers),
      requestBody: transformBody(option?.body),
    },
  );

  const res = await originFetch(input, init);

  const body = transformResponseData(res);

  void Promise.resolve(body).then((body) => {
    return networkEmitter.emit(
      "response",
      {
        id,
        status: res.status,
        statusText: res.statusText,
        responseHeaders: transformHeaders(res.headers),
        responseBody: body,
      },
    );
  });

  return res;
}
