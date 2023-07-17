export const parseStringHeaders = (rawHeaders?: string) => {
  if (!rawHeaders) return undefined;
  return rawHeaders
    .trim()
    .split("\r\n")
    .reduce<Headers>((headers, line) => {
      const parts = line.split(": ");
      const header = parts.shift();
      const value = parts.join(": ");
      if (header) {
        headers.append(header, value);
      }
      return headers;
    }, new Headers());
};

export const createResponse = (body: BodyInit | null, xhr: XMLHttpRequest) => {
  return new Response(body, {
    status: xhr.status,
    statusText: xhr.statusText,
    headers: parseStringHeaders(xhr.getAllResponseHeaders()),
  });
};

export function parseToDomParserSupportedType(
  type: string
): DOMParserSupportedType | undefined {
  const supportedTypes: Array<DOMParserSupportedType> = [
    "application/xhtml+xml",
    "application/xml",
    "image/svg+xml",
    "text/html",
    "text/xml",
  ];
  for (const supportedType of supportedTypes) {
    if (type.startsWith(supportedType)) {
      return supportedType;
    }
  }
}
