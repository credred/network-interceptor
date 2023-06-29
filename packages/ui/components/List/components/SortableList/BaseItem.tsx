import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import classNames from "classnames";
import { forwardRef } from "react";
import List from "../..";
import { usePrefixCls } from "../../../_utils/usePrefixCls";

export interface BaseItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  prefixCls?: string;
  children: React.ReactNode;
  listeners?: SyntheticListenerMap;
  isDragging?: boolean;
  isDragOverlay?: boolean;
}

const InternalBaseItem: React.ForwardRefRenderFunction<
  HTMLDivElement,
  BaseItemProps
> = (props, ref) => {
  const {
    className,
    listeners,
    prefixCls,
    isDragging,
    isDragOverlay,
    ...restProps
  } = props;

  const { prefixCls: componentCls, genCls } = usePrefixCls(
    "sortable-list-base-item",
    prefixCls
  );

  return (
    <List.Item
      ref={ref}
      {...listeners}
      {...restProps}
      className={classNames(
        className,
        componentCls,
        isDragging && genCls("dragging"),
        isDragOverlay && genCls("drag-overlay")
      )}
    >
      {props.children}
    </List.Item>
  );
};

const BaseItem = forwardRef(InternalBaseItem);

export default BaseItem;
