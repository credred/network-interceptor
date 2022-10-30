import { Button as AntdButton, ButtonProps } from "antd";
import classNames from "classnames";
import { forwardRef, Ref } from "react";
import "./index.less";

interface CompoundedComponent
  extends React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLElement>
  > {
  Group: typeof AntdButton.Group;
  __ANT_BUTTON: boolean;
}

const internalButton = (
  props: ButtonProps,
  ref: Ref<HTMLElement> | undefined
) => {
  return (
    <AntdButton
      ref={ref}
      {...props}
      className={classNames(props.className, "ui-button")}
    />
  );
};

const Button = forwardRef(internalButton) as CompoundedComponent;

Button.__ANT_BUTTON = AntdButton.__ANT_BUTTON;
Button.Group = AntdButton.Group;

export default Button;
