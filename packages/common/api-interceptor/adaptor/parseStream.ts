import { ResponseInfo } from "../types";
import convertBlobToBase64 from "../utils/convertBlobToBase64";

export const parseRequestBody = async (request: Request) => {
  return request.text();
};

export const parseResponseBody = async (
  response: Response
): Promise<Pick<ResponseInfo, "isBase64" | "responseBody">> => {
  const contentType = response.headers.get("content-type");
  if (response.body === null) {
    return { responseBody: "", isBase64: false };
  } else if (
    contentType &&
    (contentType.includes("text/") ||
      contentType.includes("application/json") ||
      contentType.includes("application/xml") ||
      contentType.includes("application/javascript"))
  ) {
    return { responseBody: await response.text(), isBase64: false };
  } else {
    return {
      responseBody: await convertBlobToBase64(await response.blob()),
      isBase64: true,
    };
  }
};
