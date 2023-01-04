import { Collapse as AntdCollapse } from "antd";
import type { CollapseProps } from "antd";
import classNames from "classnames";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";
import { CaretRightOutlined } from "@ant-design/icons";

type CompoundedComponent = React.FC<CollapseProps> & {
  Panel: typeof AntdCollapse.Panel;
};

const Collapse: CompoundedComponent = (props) => {
  const { className, ...restProps } = props;

  const renderNode: RenderNode = (classes) => (
    <AntdCollapse
      expandIcon={(panelProps) => (
        <CaretRightOutlined rotate={panelProps.isActive ? 90 : undefined} />
      )}
      className={classNames(classes, className)}
      {...restProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

Collapse.Panel = AntdCollapse.Panel;

export default Collapse;
