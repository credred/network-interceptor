import { JsonValue } from "type-fest";
import { OnMessage, OnOpenStreamChannel } from "../../types/webext-bridge";
import { StorageMessage, StorageMessageStreamName } from "./constants";
import {
  createRule,
  updateRule,
  deleteRule,
  getRule,
  clearRules,
  getAllRules,
  rules$,
} from "./db";

export const createStorageServer = (
  onMessage: OnMessage,
  onOpenStreamChannel: OnOpenStreamChannel
) => {
  onMessage(StorageMessage.createRule, ({ data }) => {
    return createRule(data);
  });

  onMessage(StorageMessage.updateRule, ({ data }) => {
    return updateRule(data);
  });

  onMessage(StorageMessage.deleteRule, ({ data }) => {
    return deleteRule(data);
  });

  onMessage(StorageMessage.getRule, ({ data }) => {
    return getRule(data);
  });

  onMessage(StorageMessage.clearRules, () => {
    return clearRules();
  });

  onMessage(StorageMessage.getAllRules, () => {
    return getAllRules();
  });

  onOpenStreamChannel(StorageMessageStreamName.ruleStream, (stream) => {
    const endpoint = { ...stream.info.endpoint };
    // fix tabId lost
    stream.info.endpoint = new Proxy(endpoint, {
      get(_, k) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Reflect.get(endpoint, k);
      },
      set() {
        // do nothing
        return true;
      },
    });
    const subscriber = rules$.subscribe((rule) => {
      stream.send(rule as unknown as JsonValue);
    });

    stream.onClose(() => {
      subscriber.unsubscribe();
    });
  });
};

export { rules$ } from "./db";
