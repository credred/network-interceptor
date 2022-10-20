import { useMount } from "ahooks";
import { NetworkRule } from "common/network-rule";
import { FC, memo, useState } from "react";
import { Button, Table, TableColumnsType } from "ui";
import { DeleteOutlined } from "@ant-design/icons";
import { deleteRule, rules$ } from "../../../../lib/storage";

const column: TableColumnsType<NetworkRule> = [
  {
    title: "Path",
    key: "path",
    render: (_, record) => record.baseMatchRule.path,
  },
  {
    title: "Method",
    key: "method",
    width: 60,
    render: (_, record) => record.baseMatchRule.method,
  },
  {
    title: "Actions",
    key: "actions",
    width: 80,
    render: (_, record) => {
      return (
        <div>
          <Button
            type="text"
            icon={<DeleteOutlined style={{ verticalAlign: "1px" }} />}
            onClick={() => void deleteRule(record.id)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];

const NetworkRules: FC = () => {
  const [rules, setRules] = useState<NetworkRule[]>([]);

  useMount(() => {
    rules$.subscribe((rules) => {
      setRules([...Object.values(rules)]);
    });
  });

  return (
    <Table
      rowKey="id"
      dataSource={rules}
      columns={column}
      pagination={false}
      scroll={{ y: 155, x: "auto" }}
      bordered
      size="small"
    ></Table>
  );
};

export default memo(NetworkRules);
