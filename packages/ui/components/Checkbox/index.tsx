import { forwardRef } from "react";
import {
  Checkbox as AntCheckbox,
  CheckboxProps as AntCheckboxProps,
} from "antd";
import classNames from "classnames";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

export interface CheckboxProps extends Omit<AntCheckboxProps, "checked"> {
  value?: boolean;
}

const InternalCheckbox: React.ForwardRefRenderFunction<
  HTMLInputElement,
  CheckboxProps
> = (props, ref) => {
  const { value, className, ...restProps } = props;

  const checkedProps = "value" in props ? { checked: value } : {};

  const renderNode: RenderNode = (classes) => (
    <AntCheckbox
      ref={ref}
      className={classNames(classes, className)}
      {...restProps}
      {...checkedProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

interface CompoundedComponent
  extends React.ForwardRefExoticComponent<
    CheckboxProps & React.RefAttributes<HTMLInputElement>
  > {
  Group: typeof AntCheckbox.Group;
  __ANT_CHECKBOX: boolean;
}

const Checkbox = forwardRef(InternalCheckbox) as CompoundedComponent;
Checkbox.Group = AntCheckbox.Group;

export default Checkbox;
