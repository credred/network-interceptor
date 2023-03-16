import { onMessage, sendMessage, setNamespace } from "webext-bridge/window";
import {
  createInterceptedFetch,
  createInterceptedXhr,
} from "common/api-interceptor";
import { InterceptorConfig } from "common/api-interceptor/types";

let ruleDisabled = false;

const oldFetch = fetch;
const oldXhr = XMLHttpRequest;
const interceptorConfig: InterceptorConfig = {
  matchRule: async (requestInfo) => {
    if (ruleDisabled) {
      return undefined;
    }
    return sendMessage("matchRule", requestInfo, "background");
  },
  requestWillBeSent: (requestInfo) => {
    void sendMessage("request", requestInfo, "devtools");
  },
  responseReceived: (responseInfo) => {
    void sendMessage("response", responseInfo, "devtools");
  },
};

const newFetch = createInterceptedFetch(oldFetch, interceptorConfig);
const newXhr = createInterceptedXhr(oldXhr, interceptorConfig);

window.fetch = newFetch;
window.XMLHttpRequest = newXhr;

// webext-bridge cannot call sendMessage immediately on load.
// so we should use setTimeout to wrap the sendMessage code
setTimeout(() => {
  void sendMessage("pageLoad", undefined, "devtools");
});

onMessage("disableRule", (message) => {
  ruleDisabled = message.data;
});

setNamespace("network-interceptor");
