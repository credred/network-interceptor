export { Submenu as ContextSubMenu, useContextMenu } from "react-contexify";
export type {
  MenuProps as ContextMenuProps,
  ItemParams as ContextMenuItemParams,
  SubMenuProps as ContextSubMenuProps,
  UseContextMenuParams,
  ShowContextMenuParams,
} from "react-contexify";
import { Menu, Item } from "react-contexify";
import type { MenuProps, ItemProps } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import "./index.less";
import { Space } from "antd";
import useElementWithStyle from "./style";
import classNames from "classnames";

export interface ContextMenuItemProps extends ItemProps {
  icon?: React.ReactNode;
}

export const ContextMenu: React.FC<MenuProps> = ({ className, ...props }) => {
  return useElementWithStyle("", (classes) => {
    console.log("classes", classes);

    return <Menu {...props} className={classNames(className, classes)} />;
  });
};

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  icon,
  children,
  ...props
}) => {
  return (
    <Item {...props}>
      {icon ? (
        <Space className={"contexify_itemContent_space"} size={4}>
          {icon}
          {children}
        </Space>
      ) : (
        children
      )}
    </Item>
  );
};
