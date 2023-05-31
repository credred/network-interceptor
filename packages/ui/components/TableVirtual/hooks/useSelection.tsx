import { TableRowSelection } from "antd/es/table/interface";
import { AnyObject } from "antd/es/table/Table";
import { useMemo } from "react";

const useSelection = <RecordType extends AnyObject>(
  rowSelection?: TableRowSelection<RecordType>
) => {
  const { selectedRowKeys } = rowSelection || {};

  const selectedRowKeySet = useMemo(
    () => new Set(selectedRowKeys),
    [selectedRowKeys]
  );

  return selectedRowKeySet;
};

export default useSelection;
