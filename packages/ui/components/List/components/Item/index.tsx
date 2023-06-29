import classNames from "classnames";
import { forwardRef, useCallback, useContext } from "react";
import { List as AntList } from "antd";
import type { ListItemProps } from "antd/es/list";
import ListContext, {
  ListContextValue,
  ListItemContext,
  ListItemContextValue,
} from "../../context";
import { ReturnTypeOrKey } from "../../utils";

const InternalItem: React.ForwardRefRenderFunction<
  HTMLDivElement,
  ListItemProps
> = <
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = ReturnTypeOrKey<R, T>
>(
  props: ListItemProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const { className, onClick, ...restProps } = props;
  const { activeKey, onItemClick, genItemCls } = useContext(
    ListContext as React.Context<ListContextValue<T, R, Q>>
  );
  const { item, key } = useContext(
    ListItemContext as React.Context<ListItemContextValue<T, R, Q>>
  );

  const mergedOnClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (ev) => {
      onClick?.(ev);
      onItemClick?.(ev, item as T, key as Q);
    },
    [onClick]
  );

  return (
    <AntList.Item
      ref={ref}
      {...restProps}
      className={classNames(
        className,
        key === activeKey && genItemCls?.("active")
      )}
      onClick={mergedOnClick}
    ></AntList.Item>
  );
};

const Item = forwardRef(InternalItem);

export default Item;
