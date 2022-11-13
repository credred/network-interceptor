import { NetworkRule } from "common/network-rule";
import { ProtocolWithReturn } from "webext-bridge";
import { StorageMessage } from "./constants";

export interface StorageProtocolMap {
  [StorageMessage.createRule]: NetworkRule;
  [StorageMessage.updateRule]: NetworkRule;
  [StorageMessage.deleteRule]: string;
  [StorageMessage.getRule]: ProtocolWithReturn<string, NetworkRule | undefined>;
  [StorageMessage.clearRules]: void;
  [StorageMessage.getAllRules]: ProtocolWithReturn<void, NetworkRule[]>;
}
