import { onMessage, sendMessage, setNamespace } from "webext-bridge/window";
import { createInterceptedFetch } from "common/api-interceptor";
import { disableRule, setRules } from "common/network-rule";

const oldFetch = fetch;
const newFetch = createInterceptedFetch(oldFetch, {
  matchRule: (requestInfo) => {
    return sendMessage("matchRule", requestInfo, "background");
  },
  requestWillBeSent: (requestInfo) => {
    void sendMessage("request", requestInfo, "devtools");
  },
  responseReceived: (responseInfo) => {
    void sendMessage("response", responseInfo, "devtools");
  },
});

window.fetch = newFetch;

onMessage("rulesChange", (rules) => {
  setRules(Array.from(Object.values(rules.data)));
});

// webext-bridge cannot call sendMessage immediately on load.
// so we should use setTimeout to wrap the sendMessage code
setTimeout(() => {
  void sendMessage("pageLoad", undefined, "devtools");
});

onMessage("disableRule", (message) => {
  disableRule(message.data);
});

setNamespace("network-interceptor");
