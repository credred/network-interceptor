import { NetworkInfo, RequestInfo, ResponseInfo } from "common/api-interceptor";
import { NetworkRule } from "common/network-rule";
import "webext-bridge";
import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
  export interface ProtocolMap {
    rulesChange: Record<string, NetworkRule>;
    disableRule: boolean;
    pageLoad: void;
    request: RequestInfo;
    response: ResponseInfo;
    matchRule: ProtocolWithReturn<NetworkInfo, NetworkRule | undefined>;
  }
}
