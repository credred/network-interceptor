export type { RequestInfo, ResponseInfo } from './types'
export { networkEmitter } from './core/event-emitter'
export { BLOB_TEXT } from './constants'

import { InterceptedFetch } from "./core/fetch.interceptor";

const originFetch = fetch

export function enable() {
  window.fetch = InterceptedFetch
}

export function disable() {
  window.fetch = originFetch
}
