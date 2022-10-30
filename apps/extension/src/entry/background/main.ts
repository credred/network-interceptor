import "webext-bridge/background";

import { matchRule, setRules } from "common/network-rule";
import { rules$ } from "../../lib/storage";
import { onMessage } from "webext-bridge/background";

rules$.subscribe((rules) => {
  setRules(Array.from(Object.values(rules)));
});

onMessage("matchRule", (msg) => {
  return matchRule(msg.data);
});
