import { FC, useMemo } from "react";
import { Table, TableColumnsType } from "ui";
import classNames from "classnames";
import { NetworkInfo } from "common/api-interceptor";
import { isEmpty } from "lodash";
import useStyles from "./styles";

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
    ellipsis: true,
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
    width: 80,
    render: (value: number, record) => {
      if (value === 0) {
        return record.statusText;
      }
      return value;
    },
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "Type",
    width: 80,
  },
];

const NetworkBrief: FC<NetworkBriefProps> = (props) => {
  const classes = useStyles();
  const { data, currentNetworkDetail, setCurrentNetworkDetail } = props;
  const dataSource = useMemo(() => Array.from(Object.values(data)), [data]);

  return (
    <>
      {!isEmpty(dataSource) ? (
        <Table<NetworkInfo>
          rowKey="id"
          className={classNames("flex-1", classes)}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: currentNetworkDetail?.id
              ? [currentNetworkDetail?.id]
              : [],
            hideSelectionColumn: true,
          }}
          onRow={(record) => {
            return {
              className: classNames(
                record.status === 0 && "networkBrief-table-row-error"
              ),
              onClick: () => {
                setCurrentNetworkDetail(record);
              },
            };
          }}
          scroll={{ y: "100%", x: "100%" }}
          bordered
          size="small"
          pagination={false}
          columns={column}
        ></Table>
      ) : (
        <div className="h-full flex justify-center items-center flex-col flex-1">
          <div>Recording network activity...</div>
          <div>Perform a request or reload</div>
        </div>
      )}
    </>
  );
};

export default NetworkBrief;
