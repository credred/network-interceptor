export class PowerRequest<Ctx = unknown> {
  request: Request;
  ctx: Ctx;

  constructor(
    input: Request | PowerRequest<Ctx> | string | URL,
    init: RequestInit | undefined,
    ctx: Ctx
  ) {
    if (input instanceof PowerRequest) {
      this.ctx = input.ctx;
      input = input.request;
    }
    this.request = new globalThis.Request(input, init);
    this.ctx = ctx;
  }

  modify(requestInit: RequestInit & { url?: string | URL }) {
    const request = new globalThis.Request(
      requestInit.url || this.request.url,
      this.request
    );
    this.request = new globalThis.Request(request, requestInit);
  }
}

export class PowerResponse {
  response: Response;

  constructor(body?: BodyInit | null | Response, init?: ResponseInit) {
    if (body instanceof Response) {
      this.response = body;
    } else {
      this.response = new globalThis.Response(body, init);
    }
  }

  modify(init?: ResponseInit & { body?: BodyInit | null }) {
    const { body, headers, status, statusText } = init || {};
    this.response = new globalThis.Response(body || this.response.body, {
      headers: headers || this.response.headers,
      status: status || this.response.status,
      statusText: statusText || this.response.statusText,
    });
  }
}
