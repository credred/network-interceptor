import { match as pathMath } from "path-to-regexp";
import uid from "tiny-uid";
import { NetworkInfo } from "../api-interceptor";
import { RULE_All_METHOD } from "../constants/options.constant";
import { METHOD } from "../models/rule.model";
import { NetworkModifyInfo, NetworkRule } from "./types";

export * from "./types";

let rules: NetworkRule[] = [];
let disabled = false;

export const disableRule = (newDisabled: boolean) => {
  disabled = newDisabled;
};

export const setRules = (newRules: NetworkRule[]) => {
  rules = newRules;
};

export const match = (request: NetworkInfo, rule: NetworkRule): boolean => {
  const requestUrl = new URL(request.url);
  const {
    baseMatchRule: { path, method, protocol, origin },
  } = rule;
  const matchUrl = pathMath(path, { decode: decodeURIComponent });
  const matchUrlResult = matchUrl(requestUrl.pathname);

  return (
    !!matchUrlResult &&
    (request.method === method || request.method === RULE_All_METHOD) &&
    (!protocol || requestUrl.protocol === protocol) &&
    (!origin || requestUrl.origin === origin)
  );
};

export const matchRules = (request: NetworkInfo) => {
  return rules.filter((rule) => match(request, rule));
};

export const matchRule = (request: NetworkInfo) => {
  if (disabled) return;
  for (const rule of rules) {
    if (match(request, rule)) {
      return rule;
    }
  }
};

export const initRuleByNetworkInfo = (
  networkInfo: NetworkInfo,
  partialRule?: Partial<NetworkRule>
): NetworkRule => {
  const requestUrl = new URL(networkInfo.url);
  return {
    ...partialRule,
    id: partialRule?.id ?? uid(),
    baseMatchRule: partialRule?.baseMatchRule ?? {
      method: networkInfo.method,
      path: requestUrl.pathname,
    },
    advanceMatchRules: partialRule?.advanceMatchRules || [],
    modifyInfo: partialRule?.modifyInfo || {
      continueRequest: false,
      response: {
        status: 200,
        responseBody: networkInfo.responseBody,
        responseHeaders: networkInfo.responseHeaders,
        statusText: "OK",
      },
    },
  };
};

export const initRule = (): NetworkRule => {
  return {
    id: uid(),
    modifyInfo: {
      response: {
        status: 200,
      },
    },
    baseMatchRule: {
      method: METHOD.GET,
      path: "/",
    },
    advanceMatchRules: [],
  };
};

export const shouldContinueRequest = (
  networkModifyInfo?: NetworkModifyInfo
) => {
  return (
    !networkModifyInfo ||
    networkModifyInfo.continueRequest ||
    !networkModifyInfo.response
  );
};

export type { NetworkRule };
