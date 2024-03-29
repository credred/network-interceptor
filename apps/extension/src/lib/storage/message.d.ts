import { NetworkRule } from "common/network-rule";
import { ProtocolWithReturn } from "webext-bridge";
import { StorageMessage } from "./constants";
import { toggleRule } from "./db";

export type Operator = string;

export interface WithOperator<T> {
  data: T;
  operator?: Operator;
}

export interface StorageProtocolMap {
  [StorageMessage.createRule]: WithOperator<NetworkRule>;
  [StorageMessage.updateRule]: WithOperator<NetworkRule>;
  [StorageMessage.deleteRule]: WithOperator<string>;
  [StorageMessage.getRule]: ProtocolWithReturn<
    WithOperator<string>,
    NetworkRule | undefined
  >;
  [StorageMessage.toggleRule]: WithOperator<Parameters<typeof toggleRule>[0]>;
  [StorageMessage.clearRules]: WithOperator<void>;
  [StorageMessage.getAllRules]: ProtocolWithReturn<
    WithOperator<void>,
    NetworkRule[]
  >;
}
