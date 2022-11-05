import { useMount } from "ahooks";
import { NetworkRule } from "common/network-rule";
import { FC, memo, useEffect, useState } from "react";
import { Editor, List } from "ui";
import { rules$ } from "../../../../lib/storage";

const NetworkRules: FC = () => {
  const [rules, setRules] = useState<NetworkRule[]>([]);
  const [activeRule, setActiveRule] = useState<NetworkRule>();

  useMount(() => {
    rules$.subscribe((rules) => {
      setRules([...Object.values(rules)]);
    });
  });

  useEffect(() => {
    if (!activeRule) {
      setActiveRule(rules[0]);
    }
  }, [rules]);

  return (
    <div className="flex h-full">
      <List
        rowKey="id"
        className="w-[260px]"
        selectable
        activeKey={activeRule?.id}
        dataSource={rules}
        onChange={(_, rule) => {
          setActiveRule(rule);
        }}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <div className="truncate">{item.baseMatchRule.path}</div>
            <div>{item.baseMatchRule.method}</div>
          </List.Item>
        )}
      ></List>
      <div className="flex-1 min-w-0">
        <Editor
          value={activeRule?.modifyInfo.response?.responseBody}
          theme="vs-dark"
          language="json"
        ></Editor>
      </div>
    </div>
  );
};

export default memo(NetworkRules);
