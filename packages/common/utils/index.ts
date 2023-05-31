import { METHOD } from "../models/rule.model";

export const httpCodeIsError = (code?: number) =>
  typeof code === "number" && code >= 400;

export const isHttpMethod = (method?: string) =>
  !!(typeof method === "string" && METHOD[method as keyof typeof METHOD]);

export const assertNonNil: <T>(value: T) => asserts value is NonNullable<T> = (
  value
) => {
  if (typeof value === "undefined" || value === null)
    throw new Error(`value is Nil`);
};
