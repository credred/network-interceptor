export const parseRequestBody = async (request: Request) => {
  return request.text();
};

export const parseResponseBody = async (response: Response) => {
  return response.text();
};
