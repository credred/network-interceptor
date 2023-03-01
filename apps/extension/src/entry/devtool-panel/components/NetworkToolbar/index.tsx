import { Button, Checkbox } from "ui";
import {
  ClearOutlined,
  StopOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { FC } from "react";
import { request } from "../utils/request";

interface NetworkToolbarProps {
  clear: () => void;
  onOpenRules: () => void;
  toggleRecord: (enabled: boolean) => void;
  disableRule: (disabled: boolean) => void;
}

const NetworkToolbar: FC<NetworkToolbarProps> = (props) => {
  const actions = {
    clear: () => props.clear(),
    onOpenRules: () => props.onOpenRules(),
    toggleRecord: (enabled: boolean) => props.toggleRecord(enabled),
    disableRule: (disabled: boolean) => props.disableRule(disabled),
  };

  return (
    <div className="flex items-center">
      <Button type="text" title="clear" onClick={actions.clear}>
        <StopOutlined className="text-[14px]" />
      </Button>
      <Checkbox onChange={(e) => actions.toggleRecord(e.target.checked)}>
        Request To Rule
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
