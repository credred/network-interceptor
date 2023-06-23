import { Tree as AntdTree, TreeProps as AntdTreeProps } from "antd";
import classNames from "classnames";
import { usePrefixCls } from "../_utils/usePrefixCls";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

interface TreeProps extends AntdTreeProps {
  /**
   * compact layout
   * @default false
   */
  compact?: boolean;
}

const Tree: React.FC<TreeProps> = (props) => {
  const { compact, className, ...restProps } = props;
  const { genCls } = usePrefixCls("tree");

  const renderNode: RenderNode = (classes) => (
    <AntdTree
      className={classNames(classes, className, compact && genCls("compact"))}
      {...restProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

export default Tree;
