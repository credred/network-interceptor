import { PowerRequest, PowerResponse } from "../base";
import { InterceptorConfig } from "../types";
import { postTask } from "../utils";
import { createResponse, isDomParserSupportedType } from "./utils";
import { parseBuffer } from "./utils/parseBuffer";
import { parseRequestBody } from "./utils/parseRequestBody";
import { readStream } from "./utils/readStream";

type fn = () => void;

const implementXhrNativeEvent = (XhrLike: typeof XMLHttpRequest) => {
  type NativeEventName = keyof {
    [P in keyof XMLHttpRequest as P extends `on${infer R}` ? R : never]: void;
  };
  const nativeEventObj: Record<NativeEventName, true> = {
    readystatechange: true,
    abort: true,
    error: true,
    load: true,
    loadend: true,
    loadstart: true,
    progress: true,
    timeout: true,
  };
  for (const eventName in nativeEventObj) {
    let value: fn | null = null;
    Object.defineProperty(XhrLike.prototype, `on${eventName}`, {
      get() {
        if (!(this instanceof XhrLike)) {
          throw new TypeError("Illegal invocation");
        }
        return value;
      },
      set(newValue) {
        if (!(this instanceof XhrLike)) {
          throw new TypeError("Illegal invocation");
        }
        if (typeof newValue !== "function") {
          newValue = null;
        }
        value = newValue as fn | null;
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originDispatchEvent = XhrLike.prototype.dispatchEvent;
  Object.defineProperties(XhrLike.prototype, {
    dispatchEvent: {
      value(event: Event): boolean {
        const result = originDispatchEvent.bind(this)(event);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const func = this[`on${event.type}`];
        if (event.type in nativeEventObj && typeof func === "function") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          func?.(event);
        }
        return result;
      },
    },
  });
};

const cloneEvent = <T extends Event>(event: T) => {
  //@ts-expect-error event.constructor is class
  return new event.constructor(event.type, event) as T;
};

const createDelayLoad = (xhr: XMLHttpRequest) => {
  let isDelaying = false;
  let loadEvent: ProgressEvent | undefined = undefined;
  let loadendEvent: ProgressEvent | undefined = undefined;
  const startDelay = () => {
    isDelaying = true;
  };

  const tryDelayLoadEvent = (event: ProgressEvent) => {
    if (isDelaying) {
      loadEvent = event;
    } else {
      xhr.dispatchEvent(cloneEvent(event));
    }
  };
  const tryDelayLoadendEvent = (event: ProgressEvent) => {
    if (isDelaying) {
      loadendEvent = event;
    } else {
      xhr.dispatchEvent(cloneEvent(event));
    }
  };

  const resumeEvent = () => {
    loadEvent && xhr.dispatchEvent(loadEvent);
    loadendEvent && xhr.dispatchEvent(loadendEvent);
    loadEvent = undefined;
    loadendEvent = undefined;
    isDelaying = false;
  };

  return { startDelay, tryDelayLoadEvent, tryDelayLoadendEvent, resumeEvent };
};

export const createInterceptedXhr = <T>(
  PureXMLHttpRequest: typeof XMLHttpRequest,
  config: InterceptorConfig<T>
): typeof XMLHttpRequest => {
  class InterceptedXhr extends EventTarget implements XMLHttpRequest {
    static {
      implementXhrNativeEvent(InterceptedXhr);
    }
    originXhr = new PureXMLHttpRequest();
    #delayLoad = createDelayLoad(this);

    constructor() {
      super();
      this.originXhr.onabort = (event) => this.dispatchEvent(cloneEvent(event));
      this.originXhr.onerror = (event) => {
        if (this.#status !== 0) {
          // the response status has been modified as successful
          this.dispatchEvent(new ProgressEvent("load"));
        } else {
          this.dispatchEvent(cloneEvent(event));
        }
      };
      this.originXhr.onload = (event) =>
        this.#delayLoad.tryDelayLoadEvent(event);
      this.originXhr.onloadend = (event) =>
        this.#delayLoad.tryDelayLoadendEvent(event);
      this.originXhr.onloadstart = (event) =>
        this.dispatchEvent(cloneEvent(event));
      this.originXhr.onreadystatechange = async () => {
        if (this.originXhr.readyState === 4) {
          // we use readystatechange event instead of onload event and onerror event, because the former is triggered first
          this.#delayLoad.startDelay();
          await this.#onPureResponse?.();
          this.#readyState = this.originXhr.readyState;
          this.#delayLoad.resumeEvent();
        } else {
          this.#readyState = this.originXhr.readyState;
        }
      };
    }

    open(method: string, url: string | URL): void;
    open(
      method: string,
      url: string | URL,
      async: boolean,
      username?: string | null | undefined,
      password?: string | null | undefined
    ): void;
    open(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null | undefined,
      password?: string | null | undefined
    ): void {
      this.#resetXhr();
      this.#url = url;
      this.#method = method;
      this.#async = async;
      this.#username = username;
      this.#password = password;
      this.#readyState = 1;
    }

    setRequestHeader(name: string, value: string): void {
      this.#verifyState();
      this.#requestHeaders.set(name, value);
    }

    send(body?: Document | XMLHttpRequestBodyInit | null | undefined): void {
      const asyncSend = async () => {
        if (body instanceof Document) {
          this.setRequestHeader("Content-Type", body.contentType);
          const serializer = new XMLSerializer();
          body = serializer.serializeToString(body);
        }
        const powerRequest = new PowerRequest(
          this.#url,
          {
            method: this.#method,
            headers: this.#requestHeaders,
            credentials: this.originXhr.withCredentials
              ? "include"
              : "same-origin",
            body: ["GET", "HEAD"].includes(this.#method.toUpperCase())
              ? null
              : body,
          },
          config.createCtx()
        );
        const powerResponse = await config.onRequest(powerRequest);

        if (!powerResponse) {
          // convertRequestBody function will break body of type blob.
          // so we use origin body directly if requestBody dost not exist
          this.#onPureResponse = async () => {
            if (this.originXhr.status === 0) {
              // xhr failed to request
              config.onError?.(powerRequest, undefined);
            } else {
              const powerResponse = new PowerResponse(
                createResponse(
                  this.originXhr.response as BodyInit,
                  this.originXhr
                )
              );
              await config.onResponse(powerRequest, powerResponse);
              await this.#applyResponse(powerResponse.response);
            }
          };
          await this.#realSend(powerRequest.request);
        } else {
          await postTask();
          this.#responseURL = powerRequest.request.url;
          this.#readyState = 2;
          await postTask();
          this.#readyState = 3;
          await postTask();
          await config.onResponse(powerRequest, powerResponse);
          await this.#applyResponse(powerResponse.response);
          this.#readyState = 4;
          this.dispatchEvent(new ProgressEvent("load"));
          this.dispatchEvent(new ProgressEvent("loadend"));
        }
      };
      this.#verifyState();
      void asyncSend();
    }

    //#region impl xhr helper
    #verifyState() {
      if (this.#readyState !== InterceptedXhr.OPENED) {
        throw new DOMException(
          "Uncaught DOMException: Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED."
        );
      }
    }

    #verifyResponseText() {
      if (!["", "text"].includes(this.originXhr.responseType)) {
        throw new DOMException(
          `Uncaught DOMException: Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was '${this.originXhr.responseType}').`
        );
      }
    }

    #verifyResponseXML() {
      if (!["", "document"].includes(this.originXhr.responseType)) {
        throw new DOMException(
          `Uncaught DOMException: Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was '${this.originXhr.responseType}').`
        );
      }
    }

    //#endregion

    //#region modifyInfo helper
    #resetXhr() {
      this.#responseURL = "";
      this.#status = 0;
      this.#url = "";
      this.#method = "";
      this.#async = undefined;
      this.#username = undefined;
      this.#password = undefined;
      this.#statusText = "";
      this.#responseHeaders = undefined;
    }
    async #realSend(request: Request) {
      if (typeof this.#async === "boolean") {
        this.originXhr.open(
          request.method,
          request.url,
          this.#async,
          this.#username,
          this.#password
        );
      } else {
        this.originXhr.open(request.method, request.url);
      }
      request.headers.forEach((value, key) => {
        this.originXhr.setRequestHeader(key, value);
      });
      this.originXhr.send(await parseRequestBody(request));
    }

    //#endregion

    //#region modifiable method
    #responseHeaders: Headers | undefined = undefined;
    getAllResponseHeaders(): string {
      if (this.#responseHeaders) {
        return (
          Array.from(this.#responseHeaders.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join("\r\n") + "\r\n"
        );
      } else {
        return this.originXhr.getAllResponseHeaders();
      }
    }

    getResponseHeader(name: string): string | null {
      if (this.#responseHeaders) {
        return this.#responseHeaders.get(name) || null;
      } else {
        return this.originXhr.getResponseHeader(name);
      }
    }
    //#endregion

    //#region modifiable prop
    #realReadyState = 0;
    #url: string | URL = "";
    #method = "";
    #async?: boolean;
    #username?: string | null;
    #password?: string | null;
    #requestHeaders = new Headers();
    #onPureResponse?: () => Promise<void>;
    #responseBuffer = new Uint8Array();
    async #applyResponse(response: Response) {
      this.#responseHeaders = response.headers;
      this.#responseBuffer = await readStream(response.body);
      this.#status = response.status;
      this.#statusText = response.statusText;
    }

    get #readyState() {
      return this.#realReadyState;
    }
    set #readyState(state) {
      const shouldDispatchEvent = this.#realReadyState !== state;
      this.#realReadyState = state;
      shouldDispatchEvent && this.dispatchEvent(new Event("readystatechange"));
    }
    #responseURL = "";
    get responseURL(): string {
      return this.#responseURL;
    }
    get readyState() {
      return this.#readyState;
    }

    get response(): unknown {
      if (this.#readyState !== this.DONE) {
        return null;
      }

      return parseBuffer(
        this.#responseBuffer,
        this.originXhr.responseType,
        this.getResponseHeader("Content-Type")
      );
    }

    get #responseBufferText() {
      const decoder = new TextDecoder();
      return decoder.decode(this.#responseBuffer);
    }

    get responseText() {
      this.#verifyResponseText();

      if (this.#readyState !== this.LOADING && this.#readyState !== this.DONE) {
        return "";
      }

      return this.#responseBufferText;
    }

    get responseXML() {
      this.#verifyResponseXML();
      if (this.#readyState !== this.DONE) {
        return null;
      }

      const contentType = this.getResponseHeader("Content-Type") || "";

      if (typeof DOMParser === "undefined") {
        console.warn(
          "Cannot retrieve XMLHttpRequest response body as XML: DOMParser is not defined. You are likely using an environment that is not browser or does not polyfill browser globals correctly."
        );
        return null;
      }

      if (isDomParserSupportedType(contentType)) {
        return new DOMParser().parseFromString(
          this.#responseBufferText,
          contentType
        );
      }

      return null;
    }

    #status = 0;
    get status() {
      return this.#status;
    }

    #statusText = "";
    get statusText() {
      return this.#statusText;
    }
    //#endregion

    //#region use originXhr directly
    get upload(): XMLHttpRequestUpload {
      return this.originXhr.upload;
    }
    get responseType(): XMLHttpRequestResponseType {
      return this.originXhr.responseType;
    }
    set responseType(type: XMLHttpRequestResponseType) {
      this.originXhr.responseType = type;
    }
    get timeout(): number {
      return this.originXhr.timeout;
    }
    set timeout(timeout: number) {
      this.originXhr.timeout = timeout;
    }
    get withCredentials(): boolean {
      return this.originXhr.withCredentials;
    }
    set withCredentials(withCredentials: boolean) {
      this.originXhr.withCredentials = withCredentials;
    }
    overrideMimeType(mime: string): void {
      this.originXhr.overrideMimeType(mime);
    }
    abort(): void {
      this.originXhr.abort();
    }
    //#endregion

    //#region never changed
    onreadystatechange = null;
    onabort = null;
    onerror = null;
    onload = null;
    onloadend = null;
    onloadstart = null;
    onprogress = null;
    ontimeout = null;
    static get DONE() {
      return PureXMLHttpRequest.DONE;
    }
    static get HEADERS_RECEIVED() {
      return PureXMLHttpRequest.HEADERS_RECEIVED;
    }
    static get LOADING() {
      return PureXMLHttpRequest.LOADING;
    }
    static get OPENED() {
      return PureXMLHttpRequest.OPENED;
    }
    static get UNSENT() {
      return PureXMLHttpRequest.UNSENT;
    }
    get DONE() {
      return PureXMLHttpRequest.DONE;
    }
    get HEADERS_RECEIVED() {
      return PureXMLHttpRequest.HEADERS_RECEIVED;
    }
    get LOADING() {
      return PureXMLHttpRequest.LOADING;
    }
    get OPENED() {
      return PureXMLHttpRequest.OPENED;
    }
    get UNSENT() {
      return PureXMLHttpRequest.UNSENT;
    }
    //#endregion
  }
  return InterceptedXhr;
};
