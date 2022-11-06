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

  return <AntCheckbox ref={ref} {...restProps} checked={value} />;
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
Checkbox.__ANT_CHECKBOX = AntCheckbox.__ANT_CHECKBOX;

export default Checkbox;
