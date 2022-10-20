import { onMessage, sendMessage, setNamespace } from "webext-bridge/window";
import { networkEmitter, enable } from "common/api-interceptor";
import { setRules } from "common/network-rule";

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

setNamespace("network-interceptor");
