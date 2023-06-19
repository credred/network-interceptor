import { PowerRequest, PowerResponse } from "../base";
import { InterceptorConfig } from "../types";

export const createInterceptedFetch = <T>(
  pureFetch: typeof fetch,
  config: InterceptorConfig<T>
) => {
  async function interceptedFetch(
    input: Request | string | URL,
    init?: RequestInit
  ): Promise<Response> {
    const powerRequest = new PowerRequest(input, init, config.createCtx());
    let powerResponse = await config.onRequest(powerRequest);

    if (!powerResponse || powerRequest.request.signal.aborted) {
      try {
        powerResponse = new PowerResponse(
          await pureFetch(powerRequest.request)
        );
      } catch (err) {
        config.onError?.(powerRequest, err);
        throw (err as Error).message;
      }
    }
    await config.onResponse(powerRequest, powerResponse);

    return powerResponse.response;
  }

  return interceptedFetch;
};
