import React, { createContext } from "react";
import { ReturnTypeOrKey } from "../../utils";

export interface SortableListItemContextValue<
  T = any,
  R extends ((item: T) => React.Key) | keyof T = any,
  Q = ReturnTypeOrKey<R, T>
> {
  isOverlay?: boolean;
}

const SortableListItemContext = createContext<SortableListItemContextValue>({});

export default SortableListItemContext;
export const SortableListItemContextProvider = SortableListItemContext.Provider;
