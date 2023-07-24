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
  toggleRule,
} from "./db";

export const createStorageServer = (
  onMessage: OnMessage,
  onOpenStreamChannel: OnOpenStreamChannel
) => {
  onMessage(StorageMessage.createRule, ({ data: { data, operator } }) => {
    return createRule(data, operator);
  });

  onMessage(StorageMessage.updateRule, ({ data: { data, operator } }) => {
    return updateRule(data, operator);
  });

  onMessage(StorageMessage.deleteRule, ({ data: { data, operator } }) => {
    return deleteRule(data, operator);
  });

  onMessage(StorageMessage.getRule, ({ data: { data } }) => {
    return getRule(data);
  });

  onMessage(StorageMessage.toggleRule, ({ data: { data } }) => {
    return toggleRule(data);
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
    const subscriber = rules$.subscribe(({ rules, operator }) => {
      stream.send({ operator, rules } as unknown as JsonValue);
    });

    stream.onClose(() => {
      subscriber.unsubscribe();
    });
  });
};

export { rules$ } from "./db";
