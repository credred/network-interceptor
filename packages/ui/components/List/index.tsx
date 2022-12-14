import { List as AntList, ListProps as AntListProps } from "antd";
import classNames from "classnames";
import React, { isValidElement, cloneElement } from "react";
import useMergedState from "rc-util/lib/hooks/useMergedState";
import { usePrefixCls } from "../_utils/usePrefixCls";
import type { ListItemProps } from "antd/es/list";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

type ReturnTypeOrKey<Fn, T> = Fn extends (...args: any[]) => any
  ? ReturnType<Fn>
  : Fn extends keyof T
  ? T[Fn]
  : never;

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

interface ListProps<
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = ReturnTypeOrKey<R, T>
> extends Omit<AntListProps<T>, "rowKey">,
    ListSelectable<T, R, Q> {}

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
    ...restProps
  } = props;
  const { genCls } = usePrefixCls("list", props.prefixCls);
  const [internalActiveKey, setInternalActiveKey] = useMergedState(
    defaultActiveKey,
    { value: activeKey }
  );

  const internalRenderItem = (item: T, index: number) => {
    const node = renderItem?.(item, index);
    if (!selectable) return node;

    let key: Q;

    if (typeof rowKey === "function") {
      key = rowKey(item) as Q;
    } else if (rowKey) {
      key = item[rowKey as keyof T] as Q;
    } else {
      key = (item as Record<"key", Q>).key;
    }

    const isSelected = key !== undefined && key === internalActiveKey;

    if (isValidElement(node) && node.type === List.Item) {
      return cloneElement(node, {
        onClick: (ev) => {
          setInternalActiveKey(key);
          (node.props as ListItemProps)?.onClick?.(ev);
          onChange?.(key, item);
        },
        className: classNames(
          (node.props as ListItemProps)?.className,
          isSelected && genCls("item-active")
        ),
      } as ListItemProps);
    }

    return node;
  };
  const renderNode: RenderNode = (classes) => (
    <AntList
      className={classNames(
        className,
        classes,
        selectable && genCls("selectable")
      )}
      renderItem={internalRenderItem}
      rowKey={rowKey}
      {...restProps}
    ></AntList>
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

List.Item = AntList.Item;

export default List;
