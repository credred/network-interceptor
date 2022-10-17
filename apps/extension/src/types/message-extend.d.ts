import { RequestInfo, ResponseInfo } from "common/api-interceptor"
import 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    request: RequestInfo
    response: ResponseInfo
  }
}
