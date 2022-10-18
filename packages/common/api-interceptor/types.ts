export interface RequestInfo {
  id: string
  type: 'xhr' | 'fetch'
  stage: 'request'
  url: string
  method: string
  requestHeaders?: Record<string, string>
  requestBody?: string
}

export interface ResponseInfo extends Omit<RequestInfo, 'stage'> {
  id: string
  stage: 'response'
  status: number
  statusText: string
  responseHeaders?: Record<string, string>
  responseBody?: string
  responseBodyParsable?: boolean
}

export type NetworkInfo = Omit<RequestInfo, 'stage'> & Partial<Omit<ResponseInfo, 'stage'>> & {
  stage: 'request' | 'response'
}

export type StrongNetworkInfo = RequestInfo | ResponseInfo

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