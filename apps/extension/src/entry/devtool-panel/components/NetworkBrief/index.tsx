import { FC, useMemo } from "react";
import { Table, TableColumnsType } from "ui";
import classNames from "classnames";
import { NetworkInfo } from "common/api-interceptor";
import { isEmpty } from 'lodash';

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
    width: 80,
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
    <>
    {!isEmpty(dataSource) ? <Table<NetworkInfo>
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
    ></Table> : <div className="h-full flex justify-center items-center flex-col flex-1">
        <div>Recording network activity...</div>
        <div>Perform a request or reload</div>
      </div>}
    </>
  );
};

export default NetworkBrief;
