import { useMemo, useState } from "react";
import classNames from "classnames";
import ResizeObserver from "rc-resize-observer";
import { usePrefixCls } from "../_utils/usePrefixCls";
import Table from "../Table";
import type { TableVirtualProps } from "./interface";
import useElementWithStyle, { RenderNode } from "./style";
import useSelection from "./hooks/useSelection";
import { GetComponentProps, GetRowKey } from "rc-table/es/interface";
import { AnyObject } from "antd/es/table/Table";
import { mergeProps } from "../_utils/mergeProps";
import useVirtualBody from "./hooks/useVirtualBody";
import parseNumber from "../_utils/parseNumber";

const TableVirtual = <RecordType extends AnyObject>(
  props: TableVirtualProps<RecordType>
) => {
  const { prefixCls, genCls } = usePrefixCls("table-virtual");
  const {
    dataSource,
    columns: propColumns,
    scroll,
    rowSelection,
    rowClassName: propRowClassName,
    rowKey,
    onRow: propOnRow,
    rowHeight = 29,
    pagination = false,
    stickToBottom = true,
  } = props;
  const [tableWidth, setTableWidth] = useState(0);
  const [tableHeight, setTableHeight] = useState(
    scroll?.y ? parseNumber(scroll.y) : 0
  );

  const widthColumnCount = propColumns.filter(({ width }) => !width).length;
  const widthColumnTotal = propColumns.reduce(
    (totalWidth, { width }) => totalWidth + (width ? parseNumber(width) : 0),
    0
  );
  const columns = propColumns.map((column) => {
    if (column.width) {
      return column;
    }

    return {
      ...column,
      width: Math.floor((tableWidth - widthColumnTotal) / widthColumnCount),
    };
  });

  // ============================ RowKey ============================
  const getRowKey = useMemo<GetRowKey<RecordType>>(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (record: RecordType) => record?.[rowKey as string];
  }, [rowKey]);

  // ============================ onRow ============================
  const selectedRowKeySet = useSelection(rowSelection);

  const rowClassName = (record: RecordType, index: number, indent: number) => {
    let mergedRowClassName: string;
    if (typeof propRowClassName === "function") {
      mergedRowClassName = classNames(propRowClassName(record, index, indent));
    } else {
      mergedRowClassName = classNames(propRowClassName);
    }

    return classNames(
      {
        [`${prefixCls}-row-selected`]: selectedRowKeySet.has(
          getRowKey(record, index)
        ),
      },
      mergedRowClassName
    );
  };

  const onRow: GetComponentProps<RecordType> = (record, index = 0) => {
    const rowProps = propOnRow?.(record, index);
    const rowPropClassName = rowClassName(record, index, 0);

    return mergeProps(rowProps || {}, { className: rowPropClassName });
  };

  const renderBody = useVirtualBody({
    dataSource,
    genCls,
    columns,
    onRow,
    tableWidth,
    tableHeight,
    rowHeight,
    stickToBottom,
  });

  const renderNode: RenderNode = (classes) => (
    <ResizeObserver
      onResize={({ width, height }) => {
        setTableWidth(width);
        setTableHeight(height - rowHeight);
      }}
    >
      <Table
        {...props}
        className={classNames(classes, props.className, genCls("wrapper"))}
        columns={columns}
        pagination={pagination}
        scroll={{ y: 200 }}
        components={{
          body: renderBody,
        }}
      />
    </ResizeObserver>
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

export default TableVirtual;
