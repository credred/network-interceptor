import { Button, Checkbox, Divider, Input } from "ui";
import { StopOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { FC } from "react";

interface NetworkToolbarProps {
  preserveLog?: boolean;
  clear: () => void;
  onOpenRules: () => void;
  search: (value: string) => void;
  togglePreserveLog: (enabled: boolean) => void;
  toggleRecord: (enabled: boolean) => void;
  disableRule: (disabled: boolean) => void;
}

const NetworkToolbar: FC<NetworkToolbarProps> = (props) => {
  const actions = {
    clear: () => props.clear(),
    onOpenRules: () => props.onOpenRules(),
    search: props.search,
    togglePreserveLog: (disabled: boolean) => props.togglePreserveLog(disabled),
    toggleRecord: (enabled: boolean) => props.toggleRecord(enabled),
    disableRule: (disabled: boolean) => props.disableRule(disabled),
  };

  return (
    <div className="flex items-center">
      <Button type="text" title="clear" onClick={actions.clear}>
        <StopOutlined className="text-[14px]" />
      </Button>
      <Divider type="vertical" />
      <Input
        size="small"
        className="w-48"
        placeholder="Filter"
        onChange={(e) => actions.search(e.target.value)}
      />
      <Divider type="vertical" />
      <Checkbox onChange={(e) => actions.toggleRecord(e.target.checked)}>
        Request To Rule
      </Checkbox>
      <Divider type="vertical" />
      <Checkbox
        value={props.preserveLog}
        onChange={(e) => actions.togglePreserveLog(e.target.checked)}
      >
        Preserve Log
      </Checkbox>
      <Checkbox onChange={(e) => actions.disableRule(e.target.checked)}>
        Disable Rule
      </Checkbox>
      <Button
        type="text"
        title="show rules"
        className="ml-auto"
        onClick={actions.onOpenRules}
      >
        <UnorderedListOutlined className="text-[14px]" />
      </Button>
    </div>
  );
};

export default NetworkToolbar;
