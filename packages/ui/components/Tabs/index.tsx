import { Tabs as AntTabs, TabsProps as AntTabsProps } from "antd";
import classNames from "classnames";
import "./index.less";

interface TabsProps extends AntTabsProps {
  /**
   * set tabs height as 100%
   * @default true
   */
  fullHeight?: boolean;
}

const FULL_HEIGHT_CLASS_NAME = "ui-tabs-full-height";

const Tabs = (props: TabsProps) => {
  const { fullHeight, ...restProps } = props;

  return (
    <AntTabs
      {...restProps}
      className={classNames(
        props.className,
        fullHeight && FULL_HEIGHT_CLASS_NAME
      )}
    />
  );
};

Tabs.defaultProps = {
  fullHeight: true,
}

Tabs.TabPane = AntTabs.TabPane;

export default Tabs;
