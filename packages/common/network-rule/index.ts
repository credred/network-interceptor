import { match as pathMath } from "path-to-regexp";
import { NetworkInfo } from "../api-interceptor";
import { NetworkRule } from "./types";

export * from "./types";

let rules: NetworkRule[] = []

export const setRules = (newRules: NetworkRule[]) => {
  rules = newRules
}

export const match = (request: NetworkInfo, rule: NetworkRule): boolean => {
  const requestUrl = new URL(request.url);
  const {
    baseMatchRule: { path, method, protocol, host },
  } = rule;
  const matchUrl = pathMath(path, { decode: decodeURIComponent });
  const matchUrlResult = matchUrl(requestUrl.pathname);

  return (
    !!matchUrlResult &&
    request.method === method &&
    (!protocol || requestUrl.protocol === protocol) &&
    (!host || requestUrl.hostname === host)
  );
};

export const matchRules = (request: NetworkInfo) => {
  return rules.filter((rule) => match(request, rule));
};

export const matchRule = (request: NetworkInfo) => {
  for (const rule of rules) {
    if (match(request, rule)) {
      return rule;
    }
  }
};

export type { NetworkRule };
