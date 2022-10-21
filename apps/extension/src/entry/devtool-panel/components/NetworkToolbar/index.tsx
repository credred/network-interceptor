import { Button, Checkbox } from "ui";
import {
  ClearOutlined,
  StopOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { clearRules } from "../../../../lib/storage/index";
import { FC } from "react";

interface NetworkToolbarProps {
  clear: () => void;
  onOpenRules: () => void;
  toggleRecord: (enabled: boolean) => void;
}

const NetworkToolbar: FC<NetworkToolbarProps> = (props) => {
  const actions = {
    clear: () => props.clear(),
    onOpenRules: () => props.onOpenRules(),
    clearRules: () => void clearRules(),
    toggleRecord: (enabled: boolean) => props.toggleRecord(enabled),
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
      <Checkbox onChange={(e) => actions.toggleRecord(e.target.checked)}>Request To Rule</Checkbox>
    </div>
  );
};

export default NetworkToolbar;
