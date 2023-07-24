import { onMessage, onOpenStreamChannel } from "webext-bridge/background";
import { matchRule, setRules } from "common/network-rule";
import { rules$, createStorageServer } from "../../lib/storage/server";
import { map } from "rxjs";

rules$
  .pipe(map(({ rules }) => rules.filter((rule) => !rule.disabled)))
  .subscribe((rules) => {
    setRules(rules);
  });

createStorageServer(onMessage, onOpenStreamChannel);

onMessage("matchRule", (msg) => {
  return matchRule(msg.data);
});
