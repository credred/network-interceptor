import { parseBufferToText } from "./parseBufferToText";

export const validType = ["json", "arraybuffer", "blob", "text"] as const;

export const parseBuffer = (
  buffer: Uint8Array,
  type: string,
  blobType?: string | null
) => {
  switch (type) {
    case "json": {
      try {
        const json = JSON.parse(parseBufferToText(buffer)) as unknown;
        return json;
      } catch (_) {
        return null;
      }
    }

    case "arraybuffer": {
      return buffer;
    }

    case "blob": {
      const mimeType = blobType || "text/plain";

      return new Blob([parseBufferToText(buffer)], {
        type: mimeType,
      });
    }

    default: {
      return parseBufferToText(buffer);
    }
  }
};
