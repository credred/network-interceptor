import { FC } from "react";
import classNames from "classnames";
import TableVirtual from "ui/components/TableVirtual";
import { ColumnType } from "ui/components/TableVirtual/interface";
import { NetworkInfo } from "common/api-interceptor";
import useStyles from "./styles";

interface NetworkBriefProps {
  dataSource: NetworkInfo[];
  isEmpty: boolean;
  currentNetworkDetail: NetworkInfo | undefined;
  setCurrentNetworkDetail: (detail: NetworkInfo | undefined) => void;
}

const columns: ColumnType<NetworkInfo>[] = [
  {
    title: "",
    dataIndex: "ruleId",
    key: "ruleId",
    width: 10,
    render: (value) => (value ? "*" : ""),
    className: "!p-0 text-center",
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
  const { dataSource, isEmpty, currentNetworkDetail, setCurrentNetworkDetail } =
    props;

  return (
    <>
      {!isEmpty ? (
        <TableVirtual<NetworkInfo>
          rowKey="id"
          className={classNames("flex-1", classes)}
          dataSource={dataSource}
          hideEmpty
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
        ></TableVirtual>
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
