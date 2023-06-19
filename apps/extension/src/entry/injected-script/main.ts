import { onMessage, sendMessage, setNamespace } from "webext-bridge/window";
import { createFetch, createXhr } from "common/api-interceptor";
import { AdaptorConfig } from "common/api-interceptor";

let allSiteDisabled = false;
let ruleDisabled = false;

const oldFetch = fetch;
const oldXhr = XMLHttpRequest;
const interceptorConfig: AdaptorConfig = {
  matchRule: async (requestInfo) => {
    if (ruleDisabled || allSiteDisabled) {
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

const newFetch = createFetch(oldFetch, interceptorConfig);
const newXhr = createXhr(oldXhr, interceptorConfig);

window.fetch = newFetch;
window.XMLHttpRequest = newXhr;

// webext-bridge cannot call sendMessage immediately on load.
// so we should use setTimeout to wrap the sendMessage code
setTimeout(() => {
  void sendMessage("pageLoad", undefined, "devtools");
  void sendMessage("pageLoad", undefined, "content-script");
});

onMessage("disableRule", (message) => {
  ruleDisabled = message.data;
});

onMessage("allSiteEnabled", (message) => {
  allSiteDisabled = !message.data;
});

setNamespace("network-interceptor");
