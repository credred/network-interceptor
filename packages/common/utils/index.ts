export const httpCodeIsError = (code?: number) =>
  typeof code === "number" && code >= 400;

export const assertNonNil: <T>(value: T) => asserts value is NonNullable<T> = (
  value
) => {
  if (typeof value === "undefined" || value === null)
    throw new Error(`value is Nil`);
};
