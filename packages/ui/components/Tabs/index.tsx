import { Tabs as AntTabs, TabsProps as AntTabsProps } from "antd";
import classNames from "classnames";
import { usePrefixCls } from "../_utils/usePrefixCls";
import "./index.less";

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

  return (
    <AntTabs
      {...restProps}
      className={classNames(
        props.className,
        fullHeight && genCls("full-height")
      )}
    />
  );
};

Tabs.defaultProps = {
  fullHeight: true,
};

Tabs.TabPane = AntTabs.TabPane;

export default Tabs;
