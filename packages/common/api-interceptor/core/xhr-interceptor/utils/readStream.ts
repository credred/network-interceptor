import { concatenateArrayBuffers } from "./concatenateArrayBuffers";

export const readStream = (
  stream: ReadableStream<Uint8Array> | null
): Promise<Uint8Array> => {
  if (!stream) {
    return Promise.resolve(new Uint8Array());
  }
  const buffers: Uint8Array[] = [];
  const reader = stream.getReader();

  return new Promise<Uint8Array>((resolve, reject) => {
    const readNextChunk = async () => {
      try {
        const { value, done } = await reader.read();

        if (done) {
          resolve(concatenateArrayBuffers(buffers));
          return;
        }

        if (value) {
          buffers.push(value);
        }
      } catch (err) {
        reject(err);
      }

      void readNextChunk();
    };

    void readNextChunk();
  });
};
