import { parseStringHeaders } from "./parseStringHeaders";

describe("parseStringHeaders", () => {
  it("parseStringHeaders", () => {
    const stringHeaders =
      "content-length: 42\r\ncontent-type: application/json;charset=UTF-8\r\netag: \r\n";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect([...parseStringHeaders(stringHeaders)!.entries()]).toEqual([
      ["content-length", "42"],
      ["content-type", "application/json;charset=UTF-8"],
      ["etag", ""],
    ]);
  });
});
