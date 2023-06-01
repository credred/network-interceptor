import type { TableColumnType as AntdTableColumnType } from "antd";
import { TableProps } from "../Table";

export type ColumnType<RecordType> = Omit<
  AntdTableColumnType<RecordType>,
  "render"
> & {
  render?: (value: any, record: RecordType, index: number) => React.ReactNode;
};

export type TableVirtualProps<RecordType> = Omit<
  TableProps<RecordType>,
  "columns"
> & {
  columns: ColumnType<RecordType>[];
  rowHeight?: number;
  stickToBottom?: boolean;
};
