import { onMessage, sendMessage, setNamespace } from "webext-bridge/window";
import {
  createInterceptedFetch,
  createInterceptedXhr,
} from "common/api-interceptor";
import { disableRule } from "common/network-rule";
import { InterceptorConfig } from "common/api-interceptor/types";

const oldFetch = fetch;
const oldXhr = XMLHttpRequest;
const interceptorConfig: InterceptorConfig = {
  matchRule: (requestInfo) => {
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
  disableRule(message.data);
});

setNamespace("network-interceptor");
