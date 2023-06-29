import React, { createContext } from "react";
import { ReturnTypeOrKey } from "./utils";

export interface ListContextValue<
  T = any,
  R extends ((item: T) => React.Key) | keyof T = any,
  Q = ReturnTypeOrKey<R, T>
> {
  activeKey?: React.Key;
  selectable?: boolean;
  rowKey?: R | undefined;
  onItemClick?: (
    ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: T,
    key: Q
  ) => void;
  genItemCls?: (suffix?: string) => string;
}

const ListContext = createContext<ListContextValue>({
  activeKey: undefined,
  selectable: undefined,
  rowKey: undefined,
  onItemClick: undefined,
  genItemCls: undefined,
});

export default ListContext;
export const ListContextProvider = ListContext.Provider;

export interface ListItemContextValue<
  T = any,
  R extends ((item: T) => React.Key) | keyof T = any,
  Q = ReturnTypeOrKey<R, T>
> {
  item?: T;
  key?: Q;
}

export const ListItemContext = createContext<ListItemContextValue>({});
export const ListItemContextProvider = ListItemContext.Provider;
