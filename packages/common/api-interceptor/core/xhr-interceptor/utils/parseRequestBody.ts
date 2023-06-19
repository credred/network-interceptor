import { readStream } from "./readStream";

export const parseRequestBody = async (request: Request) => {
  const arrayBuffer = await readStream(request.body);
  return arrayBuffer.buffer;
};
