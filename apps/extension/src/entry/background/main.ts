import { onMessage, onOpenStreamChannel } from "webext-bridge/background";
import { matchRule, setRules } from "common/network-rule";
import { rules$, createStorageServer } from "../../lib/storage/server";

rules$.subscribe(({ rules }) => {
  setRules(rules);
});

createStorageServer(onMessage, onOpenStreamChannel);

onMessage("matchRule", (msg) => {
  return matchRule(msg.data);
});
