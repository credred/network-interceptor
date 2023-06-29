import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useMemo, useState } from "react";
import List, { ListProps } from "../../List";
import { usePrefixCls } from "../../../_utils/usePrefixCls";
import { getKey } from "../../utils";
import SortableItem from "./SortableItem";
import { SortableItemStatus } from "./type";
import useElementWithStyle, { RenderNode } from "./style";
import classNames from "classnames";
import { SortableListItemContextProvider } from "./context";
import { sortableListClsNamespace } from "./constants";
import { ListItemContextProvider } from "../../context";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export interface SortableListProps<
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = R extends (...args: any[]) => React.Key ? ReturnType<R> : R
> extends Omit<ListProps<T, R, Q>, "renderItem"> {
  renderItem: (
    item: T,
    index: number,
    status?: SortableItemStatus
  ) => React.ReactNode;
}

const SortableList = <
  T,
  R extends ((item: T) => React.Key) | keyof T,
  Q = R extends (...args: any[]) => React.Key ? ReturnType<R> : R
>(
  props: SortableListProps<T, R, Q>
) => {
  const { dataSource, rowKey, prefixCls } = props;
  const { prefixCls: componentCls, genCls } = usePrefixCls(
    sortableListClsNamespace,
    prefixCls
  );

  const keyAndDataSource = useMemo(() => {
    return (dataSource || []).reduce<Record<React.Key, T>>(
      (result, item, index) => {
        result[getKey(item, rowKey, index)] = item;
        return result;
      },
      {}
    );
  }, [dataSource, rowKey]);
  const sortableItems = useMemo(() => {
    return Object.keys(keyAndDataSource);
  }, [keyAndDataSource]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  function handleDragStart(event: DragStartEvent) {
    console.log("event.active.data", event.active.id);

    setActiveId(event.active.id);
  }

  function handleDragEnd() {
    setActiveId(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const renderNode: RenderNode = (classes) => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <List
          {...props}
          className={classNames(props.className, componentCls, classes)}
          header={
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeId ? (
                <SortableListItemContextProvider value={{ isOverlay: true }}>
                  <ListItemContextProvider
                    value={{ item: keyAndDataSource[activeId], key: activeId }}
                  >
                    {props.renderItem(keyAndDataSource[activeId], 0, {
                      isOverlay: true,
                    })}
                  </ListItemContextProvider>
                </SortableListItemContextProvider>
              ) : null}
            </DragOverlay>
          }
        />
      </SortableContext>
    </DndContext>
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

SortableList.Item = SortableItem;

export default SortableList;
