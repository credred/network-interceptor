import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ListItemProps } from "antd/es/list";
import classNames from "classnames";
import { forwardRef, useContext } from "react";
import { usePrefixCls } from "../../../_utils/usePrefixCls";
import { ListItemContext, ListItemContextValue } from "../../context";
import List from "../../List";
import { ReturnTypeOrKey } from "../../utils";
import { sortableListClsNamespace } from "./constants";
import SortableListItemContext from "./context";

const clsNamespace = `${sortableListClsNamespace}-item`;

const InternalSortableItem: React.ForwardRefRenderFunction<
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
  const { className, ...restProps } = props;
  const { key } = useContext(
    ListItemContext as React.Context<ListItemContextValue<T, R, Q>>
  );
  const { isOverlay } = useContext(SortableListItemContext);
  const { prefixCls, genCls } = usePrefixCls(clsNamespace);

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: key as UniqueIdentifier });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const draggableItemProps = {
    ref: (node: HTMLDivElement) => {
      setNodeRef(node);
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    },
    style,
    ...attributes,
    ...listeners,
  };

  return (
    <List.Item
      className={classNames(
        className,
        prefixCls,
        isDragging && genCls("dragging"),
        isOverlay && genCls("overlay")
      )}
      {...(!isOverlay ? draggableItemProps : {})}
      {...restProps}
    ></List.Item>
  );
};

const SortableItem = forwardRef(InternalSortableItem);

export default SortableItem;
