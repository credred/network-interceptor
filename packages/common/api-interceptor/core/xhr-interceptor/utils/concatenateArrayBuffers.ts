export function concatenateArrayBuffers(arrayBuffers: Uint8Array[]) {
  const totalLength = arrayBuffers.reduce(function (length, buffer) {
    return length + buffer.byteLength;
  }, 0);

  const result = new Uint8Array(totalLength);
  let offset = 0;

  arrayBuffers.forEach(function (buffer) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  return result;
}
