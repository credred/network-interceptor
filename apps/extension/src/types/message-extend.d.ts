import { NetworkInfo, RequestInfo, ResponseInfo } from "common/api-interceptor";
import { NetworkRule } from "common/network-rule";
import "webext-bridge";
import { ProtocolWithReturn } from "webext-bridge";
import { StorageProtocolMap } from "../lib/storage/message";

declare module "webext-bridge" {
  export interface ProtocolMap extends StorageProtocolMap {
    disableRule: boolean;
    pageLoad: void;
    request: RequestInfo;
    response: ResponseInfo;
    matchRule: ProtocolWithReturn<NetworkInfo, NetworkRule | undefined>;
  }
}
