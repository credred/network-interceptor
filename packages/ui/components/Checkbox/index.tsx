import { forwardRef } from "react";
import {
  Checkbox as AntCheckbox,
  CheckboxProps as AntCheckboxProps,
} from "antd";

export interface CheckboxProps extends Omit<AntCheckboxProps, "checked"> {
  value?: boolean;
}

const InternalCheckbox: React.ForwardRefRenderFunction<
  HTMLInputElement,
  CheckboxProps
> = (props, ref) => {
  const { value, ...restProps } = props;

  const checkedProps = "value" in props ? { checked: value } : {};

  return <AntCheckbox ref={ref} {...restProps} {...checkedProps} />;
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
