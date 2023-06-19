export const parseBufferToText = (buffer: Uint8Array) => {
  return new TextDecoder().decode(buffer);
};
