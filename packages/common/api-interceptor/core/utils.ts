import { upperFirst } from "lodash";
import { NetworkModifyInfo } from "../../network-rule";
import { RequestInfo, ResponseInfo } from "../types";
import { AdvancedRequestInfo } from "../utils/RequestInfo";

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
  requestInfo: AdvancedRequestInfo,
  modifyInfo?: NetworkModifyInfo["request"],
  ruleId?: string
): AdvancedRequestInfo => {
  if (ruleId) {
    requestInfo = requestInfo.copy({ ruleId });
  }
  if (modifyInfo) {
    return requestInfo.copy({
      ...generateOriginProp(requestInfo, modifyInfo, "requestHeaders"),
      ...generateOriginProp(requestInfo, modifyInfo, "requestBody"),
    });
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

export const generateErrorResponseInfo = (
  requestInfo: AdvancedRequestInfo | RequestInfo
): ResponseInfo => {
  const serializedRequestInfo =
    requestInfo instanceof AdvancedRequestInfo
      ? requestInfo.serialize()
      : requestInfo;
  return {
    ...serializedRequestInfo,
    stage: "response",
    status: 0,
    statusText: "(failed)",
    responseBody: "",
    responseBodyParsable: true,
  };
};

export const postTask = (): Promise<void> => {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      resolve();
    };
    channel.port2.postMessage("");
  });
};
