import _, { forEach, toString } from "lodash";
import uid from "tiny-uid";
import {
  NetworkModifyInfo,
  shouldContinueRequest,
} from "../../../network-rule";
import { InterceptorConfig, RequestInfo, ResponseInfo } from "../../types";
import { applyModifyInfoToRequestInfo, postTask } from "../utils";

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
          func?.();
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

export const createInterceptedXhr = (
  OriginXhr: typeof XMLHttpRequest,
  config: InterceptorConfig
): typeof XMLHttpRequest => {
  class InterceptedXhr extends EventTarget implements XMLHttpRequest {
    static {
      implementXhrNativeEvent(InterceptedXhr);
    }
    originXhr = new OriginXhr();

    constructor() {
      super();
      this.originXhr.onabort = (event) => this.dispatchEvent(cloneEvent(event));
      this.originXhr.onerror = (event) => this.dispatchEvent(cloneEvent(event));
      this.originXhr.onload = (event) => this.dispatchEvent(cloneEvent(event));
      this.originXhr.onloadend = (event) =>
        this.dispatchEvent(cloneEvent(event));
      this.originXhr.onloadstart = (event) =>
        this.dispatchEvent(cloneEvent(event));
      this.originXhr.onreadystatechange = () => {
        if (this.originXhr.readyState === 4) {
          this.#changeXhrResponseByModifyInfo(this.originXhr);
          const responseInfo = this.#generateResponseInfoByXhr();
          config.responseReceived(responseInfo);
        }
        this.#readyState = this.originXhr.readyState;
      };
    }

    #requestInfo: RequestInfo | undefined = undefined;
    #networkModifyInfo?: NetworkModifyInfo;

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
      if (typeof async === "boolean") {
        this.originXhr.open(method, url, async, username, password);
      } else {
        this.originXhr.open(method, url);
      }
      this.#requestInfo = {
        id: uid(),
        url: toString(new URL(url, location.href).toString()),
        stage: "request",
        type: "xhr",
        method: toString(method).toUpperCase(),
        requestHeaders: {},
      };
      this.#resetXhr();
      this.#readyState = 1;
    }

    setRequestHeader(name: string, value: string): void {
      this.#verifyState();
      if (!this.#requestInfo) return;
      if (!this.#requestInfo.requestHeaders) {
        this.#requestInfo.requestHeaders = {};
      }
      this.#requestInfo.requestHeaders[name] = value;
    }

    send(body?: Document | XMLHttpRequestBodyInit | null | undefined): void {
      const asyncSend = async () => {
        if (!this.#requestInfo) return;
        this.#requestInfo.requestBody = await this.#convertRequestBody(body);
        const rule = await config.matchRule(this.#requestInfo);
        this.#networkModifyInfo = rule?.modifyInfo;
        this.#requestInfo = applyModifyInfoToRequestInfo(
          this.#requestInfo,
          rule?.modifyInfo?.request,
          rule?.id
        );
        config.requestWillBeSent(this.#requestInfo);

        if (shouldContinueRequest(this.#networkModifyInfo)) {
          this.#realSend();
        } else {
          await postTask();
          this.#responseURL = this.#requestInfo.url;
          this.#readyState = 2;
          await postTask();
          this.#readyState = 3;
          await postTask();
          this.#changeXhrResponseByModifyInfo();
          const responseInfo = this.#generateResponseInfoByXhr();
          config.responseReceived(responseInfo);
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

    #convertRequestBody(
      body?: Document | XMLHttpRequestBodyInit | null | undefined
    ) {
      if (body instanceof Document) {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(body);
      } else if (_.isObject(body)) {
        return new Response(body).text();
      } else {
        return toString(body);
      }
    }

    #convertResponseBody(responseBody?: string) {
      if (this.responseType === "" || this.responseText === "text") {
        return responseBody;
      } else if (this.responseType === "json") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return JSON.parse(responseBody || "");
        } catch (e) {
          // Return parsing failure as null
          return null;
        }
      }

      return responseBody;
    }

    #parseResponseHeaders(rawHeaders?: string) {
      if (!rawHeaders) return {};
      return rawHeaders
        .trim()
        .split("\r\n")
        .reduce<Record<string, string>>((headerMap, line) => {
          const parts = line.split(": ");
          const header = parts.shift();
          const value = parts.join(": ");
          if (header) {
            headerMap[header] = value;
          }
          return headerMap;
        }, {});
    }
    //#endregion

    //#region modifyInfo helper
    #resetXhr() {
      this.#responseURL = "";
      this.#response = "";
      this.#responseText = "";
      this.#status = 0;
      this.#statusText = "";
      this.#responseHeaders = undefined;
    }
    #realSend() {
      if (!this.#requestInfo) return;
      forEach(this.#requestInfo.requestHeaders, (value, key) => {
        this.originXhr.setRequestHeader(key, value);
      });
      this.originXhr.send(this.#requestInfo.requestBody);
    }
    #changeXhrResponseByModifyInfo(xhr?: XMLHttpRequest) {
      const modifyInfo = this.#networkModifyInfo?.response;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.#response =
        this.#convertResponseBody(modifyInfo?.responseBody) ||
        xhr?.response ||
        "";
      this.#responseText = modifyInfo?.responseBody || xhr?.responseText || "";
      this.#status = modifyInfo?.status || xhr?.status || 200;
      this.#statusText = modifyInfo?.statusText || xhr?.statusText || "";
      this.#responseHeaders =
        modifyInfo?.responseHeaders ||
        this.#parseResponseHeaders(xhr?.getAllResponseHeaders());
    }
    #generateResponseInfoByXhr(): ResponseInfo {
      return {
        id: this.#requestInfo!.id,
        stage: "response",
        status: this.status,
        statusText: this.statusText,
        responseHeaders: this.#responseHeaders,
        responseBody: this.responseText,
        responseBodyParsable: true,
      };
    }
    //#endregion

    //#region modifiable method
    #responseHeaders: Record<string, string> | undefined = undefined;
    getAllResponseHeaders(): string {
      if (this.#responseHeaders) {
        return (
          Object.entries(this.#responseHeaders)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\r\n") + "\r\n"
        );
      } else {
        return this.originXhr.getAllResponseHeaders();
      }
    }

    getResponseHeader(name: string): string | null {
      if (this.#responseHeaders) {
        return this.#responseHeaders[name] || null;
      } else {
        return this.originXhr.getResponseHeader(name);
      }
    }
    //#endregion

    //#region modifiable prop
    #realReadyState = 0;
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

    #response = "";
    get response(): any {
      return this.#response;
    }

    #responseText = "";
    get responseText() {
      return this.#responseText;
    }

    #responseXML = null;
    get responseXML() {
      return this.#responseXML;
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
      return OriginXhr.DONE;
    }
    static get HEADERS_RECEIVED() {
      return OriginXhr.HEADERS_RECEIVED;
    }
    static get LOADING() {
      return OriginXhr.LOADING;
    }
    static get OPENED() {
      return OriginXhr.OPENED;
    }
    static get UNSENT() {
      return OriginXhr.UNSENT;
    }
    get DONE() {
      return OriginXhr.DONE;
    }
    get HEADERS_RECEIVED() {
      return OriginXhr.HEADERS_RECEIVED;
    }
    get LOADING() {
      return OriginXhr.LOADING;
    }
    get OPENED() {
      return OriginXhr.OPENED;
    }
    get UNSENT() {
      return OriginXhr.UNSENT;
    }
    //#endregion
  }
  return InterceptedXhr;
};
