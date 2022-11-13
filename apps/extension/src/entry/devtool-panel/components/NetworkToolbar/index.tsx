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
    clearRules: () => void request.clearRules(),
    toggleRecord: (enabled: boolean) => props.toggleRecord(enabled),
    disableRule: (disabled: boolean) => props.disableRule(disabled),
  };

  return (
    <div className="flex items-center">
      <Button type="link" title="clear" onClick={actions.clear}>
        <StopOutlined />
      </Button>
      <Button type="link" title="clear rules" onClick={actions.clearRules}>
        <ClearOutlined />
      </Button>
      <Button type="link" title="show rules" onClick={actions.onOpenRules}>
        <UnorderedListOutlined />
      </Button>
      <Checkbox onChange={(e) => actions.toggleRecord(e.target.checked)}>
        Request To Rule
      </Checkbox>
      <Checkbox onChange={(e) => actions.disableRule(e.target.checked)}>
        Disable Rule
      </Checkbox>
    </div>
  );
};

export default NetworkToolbar;
