import { forwardRef, Ref } from "react";
import { Button as AntdButton, ButtonProps } from "antd";
import classNames from "classnames";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

interface CompoundedComponent
  extends React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLElement>
  > {
  Group: typeof AntdButton.Group;
}

const internalButton = (
  props: ButtonProps,
  ref: Ref<HTMLElement> | undefined
) => {
  const { className, ...restProps } = props;

  const renderNode: RenderNode = (classes) => (
    <AntdButton
      ref={ref}
      className={classNames(classes, className)}
      {...restProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

const Button = forwardRef(internalButton) as CompoundedComponent;

Button.Group = AntdButton.Group;

export default Button;
