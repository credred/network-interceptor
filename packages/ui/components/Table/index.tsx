import { ForwardedRef, forwardRef } from "react";
import { Table as AntTable, TableProps as AntdTableProps } from "antd";
import classNames from "classnames";
import { usePrefixCls } from "../_utils/usePrefixCls";
import "./index.less";

interface TableProps<RecordType> extends AntdTableProps<RecordType> {
  /**
   * set table height as 100%
   * @default true
   */
  fullHeight?: boolean;
}

const InternalTable = <RecordType extends object = any>(
  props: TableProps<RecordType>,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const { fullHeight, ...restProps } = props;
  const { genCls } = usePrefixCls("table");

  return (
    <AntTable
      ref={ref}
      {...restProps}
      className={classNames(
        props.className,
        fullHeight && genCls("wrapper-full-height")
      )}
    />
  );
};

const ForwardTable = forwardRef(InternalTable) as <
  RecordType extends object = any
>(
  props: React.PropsWithChildren<TableProps<RecordType>> & {
    ref?: React.Ref<HTMLDivElement>;
  }
) => React.ReactElement;

type InternalTableType = typeof ForwardTable &
  React.FunctionComponent<TableProps<any>>;

type TableInterface = Pick<typeof AntTable, keyof typeof AntTable> &
  InternalTableType;

const Table = ForwardTable as TableInterface;

Table.defaultProps = {
  ...AntTable.defaultProps,
  fullHeight: true,
};
// copy AntTable property
Table.SELECTION_COLUMN = AntTable.SELECTION_COLUMN;
Table.EXPAND_COLUMN = AntTable.EXPAND_COLUMN;
Table.SELECTION_ALL = AntTable.SELECTION_ALL;
Table.SELECTION_INVERT = AntTable.SELECTION_INVERT;
Table.SELECTION_NONE = AntTable.SELECTION_NONE;
Table.Column = AntTable.Column;
Table.ColumnGroup = AntTable.ColumnGroup;
Table.Summary = AntTable.Summary;

export default Table;
