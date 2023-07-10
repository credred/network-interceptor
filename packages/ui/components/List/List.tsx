import { useCallback } from "react";
import { List as AntList, ListProps as AntListProps } from "antd";
import classNames from "classnames";
import React, { useMemo } from "react";
import useMergedState from "rc-util/lib/hooks/useMergedState";
import { usePrefixCls } from "../_utils/usePrefixCls";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

interface ListSelectable<
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = ReturnTypeOrKey<R, T>
> {
  /**
   * List.Item selectable
   * @default {false}
   */
  selectable?: boolean;
  /** Current selected item's key */
  activeKey?: Q;
  /** Initial selected item's key, if `activeKey` is not set */
  defaultActiveKey?: Q;
  /** Row's unique key, could be a string or function that returns a string */
  rowKey?: R;
  /** Callback executed when selected item is changed */
  onChange?: (activeKey: Q, selectedRow: T) => void;
}

import { getKey, ReturnTypeOrKey } from "./utils";
import {
  ListContextProvider,
  ListContextValue,
  ListItemContextProvider,
} from "./context";
import Item from "./components/Item";

export interface ListProps<
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = ReturnTypeOrKey<R, T>
> extends Omit<AntListProps<T>, "rowKey">,
    ListSelectable<T, R, Q> {
  /**
   * Determine whether there is padding in the header and footer
   */
  compact?: boolean;
}

const List = <
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = R extends (...args: any[]) => any ? ReturnType<R> : R
>(
  props: ListProps<T, R, Q>
) => {
  const {
    selectable,
    activeKey,
    defaultActiveKey,
    onChange,
    rowKey,
    renderItem,
    className,
    compact,
    ...restProps
  } = props;
  const { genCls } = usePrefixCls("list", props.prefixCls);
  const [internalActiveKey, setInternalActiveKey] = useMergedState(
    defaultActiveKey,
    { value: activeKey }
  );

  const onItemClick: NonNullable<ListContextValue<T>["onItemClick"]> =
    useCallback(
      (_ev, item, key) => {
        setInternalActiveKey(key as Q);
        onChange?.(key as Q, item);
      },
      [setInternalActiveKey, onChange]
    );

  const internalRenderItem = (item: T, index: number) => {
    const key = getKey(
      item,
      rowKey as ((item: T) => React.Key) | keyof T | undefined,
      index
    );
    return (
      <ListItemContextProvider value={{ item, key }}>
        {renderItem?.(item, index)}
      </ListItemContextProvider>
    );
  };

  const listContextProviderValue = useMemo<ListContextValue<T>>(() => {
    return {
      activeKey: internalActiveKey as React.Key,
      renderItem,
      selectable,
      rowKey,
      onItemClick,
      genItemCls: (suffix) =>
        suffix ? genCls(`item-${suffix}`) : genCls("item"),
    };
  }, [activeKey, selectable, rowKey, onItemClick, renderItem, genCls]);

  const renderNode: RenderNode = (classes) => (
    <ListContextProvider value={listContextProviderValue}>
      <AntList
        className={classNames(
          className,
          classes,
          selectable && genCls("selectable"),
          compact && genCls("compact")
        )}
        renderItem={internalRenderItem}
        rowKey={rowKey}
        {...restProps}
      ></AntList>
    </ListContextProvider>
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

List.Item = Item;

export default List;
