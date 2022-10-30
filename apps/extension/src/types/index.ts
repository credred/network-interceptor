import { NetworkRule } from "common/network-rule";

export type CreateNetworkRuleParam = Omit<NetworkRule, "id">;
