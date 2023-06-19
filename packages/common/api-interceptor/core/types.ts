import { PowerRequest, PowerResponse } from "./base";

export interface InterceptorConfig<T> {
  createCtx: () => T;
  onRequest: (request: PowerRequest<T>) => Promise<PowerResponse | void>;
  onResponse: (
    request: PowerRequest<T>,
    response: PowerResponse
  ) => Promise<void>;
  onError?: (request: PowerRequest<T>, err: unknown) => void;
}
