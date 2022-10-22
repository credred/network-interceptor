import { onMessage, sendMessage, setNamespace } from "webext-bridge/window";
import { networkEmitter, enable } from "common/api-interceptor";
import { disableRule, setRules } from "common/network-rule";

enable();

networkEmitter.on("request", (requestInfo) => {
  void sendMessage("request", requestInfo, "devtools");
});

networkEmitter.on("response", (responseInfo) => {
  void sendMessage("response", responseInfo, "devtools");
});

onMessage("rulesChange", (rules) => {
  setRules(Array.from(Object.values(rules.data)));
});

// webext-bridge cannot call sendMessage immediately on load.
// so we should use setTimeout to wrap the sendMessage code 
setTimeout(() => {
  void sendMessage("pageLoad", undefined, "devtools")
});

onMessage("disableRule", (message) => {
  disableRule(message.data);
});

setNamespace("network-interceptor");
