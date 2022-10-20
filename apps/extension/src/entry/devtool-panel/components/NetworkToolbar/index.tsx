import { Button } from "ui";
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
}

const NetworkToolbar: FC<NetworkToolbarProps> = (props) => {
  const actions = {
    clear: () => props.clear(),
    onOpenRules: () => props.onOpenRules(),
    clearRules: () => void clearRules(),
  };

  return (
    <div>
      <Button type="link" title="clear" onClick={actions.clear}>
        <StopOutlined />
      </Button>
      <Button type="link" title="clear rules" onClick={actions.clearRules}>
        <ClearOutlined />
      </Button>
      <Button type="link" title="show rules" onClick={actions.onOpenRules}>
        <UnorderedListOutlined />
      </Button>
    </div>
  );
};

export default NetworkToolbar;
