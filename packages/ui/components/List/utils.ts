export type ReturnTypeOrKey<Fn, T> = Fn extends (...args: any[]) => any
  ? ReturnType<Fn>
  : Fn extends keyof T
  ? T[Fn]
  : never;

export const getKey = <
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = ReturnTypeOrKey<R, T>
>(
  item: T,
  rowKey: R | undefined,
  index: number
) => {
  let key: React.Key;

  if (typeof rowKey === "function") {
    key = rowKey(item);
  } else if (rowKey) {
    key = item[rowKey as keyof T] as React.Key;
  } else {
    key = (item as Record<"key", Q>).key as React.Key;
  }

  if (!key) {
    key = `list-item-${index}`;
  }

  return key;
};
