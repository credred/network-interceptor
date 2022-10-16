export interface RequestInfo {
  id: string
  type: 'xhr' | 'fetch'
  url: string
  method: string
  requestHeaders?: Record<string, string>
  requestBody?: string
}

export interface ResponseInfo {
  id: string
  status: number
  statusText: string
  responseHeaders?: Record<string, string>
  responseBody?: string | object
}

export interface NetworkEmitterEventMap {
  request: RequestInfo
  response: ResponseInfo
}

export declare class NetworkEmitter {
  on<K extends keyof NetworkEmitterEventMap>(event: K, listener: (ev: NetworkEmitterEventMap[K]) => void, ctx?: any): this;
  once<K extends keyof NetworkEmitterEventMap>(event: K, listener: (ev: NetworkEmitterEventMap[K]) => void, ctx?: any): this;
  emit<K extends keyof NetworkEmitterEventMap>(event: K, eventInfo: NetworkEmitterEventMap[K]): this;
  off<K extends keyof NetworkEmitterEventMap>(event: K, listener?: (ev: NetworkEmitterEventMap[K]) => void): this;
}