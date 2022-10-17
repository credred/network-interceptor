import { RequestInfo, ResponseInfo } from "common/network-interceptor"
import 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    request: RequestInfo
    response: ResponseInfo
  }
}
