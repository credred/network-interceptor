import { Tabs as AntTabs, TabsProps as AntTabsProps } from "antd";
import classNames from "classnames";
import { usePrefixCls } from "../_utils/usePrefixCls";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

interface TabsProps extends AntTabsProps {
  /**
   * set tabs height as 100%
   * @default true
   */
  fullHeight?: boolean;
}

const Tabs = (props: TabsProps) => {
  const { fullHeight, ...restProps } = props;
  const { genCls } = usePrefixCls("tabs");

  const renderNode: RenderNode = (classes) => (
    <AntTabs
      {...restProps}
      className={classNames(
        props.className,
        classes,
        fullHeight && genCls("full-height")
      )}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

Tabs.defaultProps = {
  fullHeight: true,
};

Tabs.TabPane = AntTabs.TabPane;

export default Tabs;
