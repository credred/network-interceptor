export const parseStringHeaders = (rawHeaders?: string) => {
  if (!rawHeaders) return undefined;
  return rawHeaders.split("\n").reduce<Headers>((headers, line) => {
    const i = line.indexOf(":");
    const header = line.substring(0, i).trim();
    const value = line.substring(i + 1).trim();

    if (header) {
      headers.append(header, value);
    }
    return headers;
  }, new Headers());
};
