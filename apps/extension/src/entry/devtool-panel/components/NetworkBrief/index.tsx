import { FC, useMemo } from "react";
import { Table, TableColumnsType } from "ui";
import classNames from "classnames";
import { NetworkInfo } from "common/api-interceptor";

interface NetworkBriefProps {
  data: Record<string, NetworkInfo>;
  currentNetworkDetail: NetworkInfo | undefined;
  setCurrentNetworkDetail: (detail: NetworkInfo | undefined) => void;
}

const column: TableColumnsType<NetworkInfo> = [
  {
    title: "",
    dataIndex: "ruleId",
    key: "ruleId",
    width: 10,
    render: (value) => (value ? "*" : ""),
  },
  {
    title: "Url",
    dataIndex: "url",
    key: "url",
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "Status",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "Type",
  },
];

const NetworkBrief: FC<NetworkBriefProps> = (props) => {
  const { data, currentNetworkDetail, setCurrentNetworkDetail } = props;
  const dataSource = useMemo(() => Array.from(Object.values(data)), [data]);

  return (
    <Table<NetworkInfo>
      rowKey="id"
      dataSource={dataSource}
      onRow={(record) => {
        return {
          className: classNames(
            record.id === currentNetworkDetail?.id && "ant-table-row-selected"
          ),
          onClick: () => {
            setCurrentNetworkDetail(record);
          },
        };
      }}
      scroll={{ y: "100%", x: "auto" }}
      bordered
      size="small"
      pagination={false}
      columns={column}
    ></Table>
  );
};

export default NetworkBrief;
