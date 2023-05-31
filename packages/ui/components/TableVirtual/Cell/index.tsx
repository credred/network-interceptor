import React, { useContext } from "react";
import classNames from "classnames";
import { GridChildComponentProps } from "react-window";
import { default as useCellRender } from "rc-table/es/Cell/useCellRender";
import { ColumnType } from "antd/es/table";
import { hoverStateContext } from "./hoverStateContext";
import { mergeProps } from "../../_utils/mergeProps";
import { GetComponentProps } from "rc-table/es/interface";

export interface CellData<T> {
  data: readonly T[];
  columns: ColumnType<any>[];
  prefixCls: string;
  onRow?: GetComponentProps<any>;
}

const BaseCell = <R, T extends CellData<R>>({
  columnIndex,
  rowIndex,
  style,
  data: { data, columns, prefixCls, onRow },
}: GridChildComponentProps<T>) => {
  const record = data[rowIndex];
  const { render, dataIndex, className, ellipsis, shouldCellUpdate, onCell } =
    columns[columnIndex];
  const { hoveredRowIndex, setHoveredRowIndex } = useContext(hoverStateContext);
  let additionalProps: React.HTMLAttributes<HTMLElement> = {};
  if (onRow) {
    additionalProps = onRow(record, rowIndex);
  }
  if (onCell) {
    additionalProps = mergeProps(
      additionalProps,
      onCell(record, rowIndex)
    ) as React.HTMLAttributes<HTMLElement>;
  }

  const cellPrefixCls = `${prefixCls}-cell`;
  const mergedClassName = classNames(
    cellPrefixCls,
    className,
    {
      [`${cellPrefixCls}-ellipsis`]: ellipsis,
      [`${cellPrefixCls}-hover`]: hoveredRowIndex === rowIndex,
    },
    additionalProps.className
  );

  additionalProps = {
    ...additionalProps,
    style: { ...style, ...additionalProps.style },
  };

  const [childNode, legacyCellProps] = useCellRender(
    record,
    // useCellRender allow dataIndex is undefined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dataIndex!,
    rowIndex,
    additionalProps.children,
    render,
    shouldCellUpdate
  );

  const onMouseEnter: React.MouseEventHandler<HTMLTableCellElement> = (
    event
  ) => {
    if (record) {
      setHoveredRowIndex(rowIndex);
    }

    additionalProps?.onMouseEnter?.(event);
  };

  const onMouseLeave: React.MouseEventHandler<HTMLTableCellElement> = (
    event
  ) => {
    if (record) {
      // reset hover state when current cell is hovered
      setHoveredRowIndex((currentHoveredRowIndex) =>
        currentHoveredRowIndex !== hoveredRowIndex
          ? currentHoveredRowIndex
          : undefined
      );
    }

    additionalProps?.onMouseLeave?.(event);
  };

  return (
    <div
      {...legacyCellProps}
      {...additionalProps}
      className={mergedClassName}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {childNode}
    </div>
  );
};

const Cell = React.memo(BaseCell);

export default Cell;
