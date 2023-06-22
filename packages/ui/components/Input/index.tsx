import { forwardRef, Ref } from "react";
import { Input as AntdInput, InputProps, InputRef } from "antd";
import classNames from "classnames";
import useElementWithStyle from "./style";
import type { RenderNode } from "./style";

type CompoundedComponent = React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<InputRef>
> & {
  Group: typeof AntdInput.Group;
  Search: typeof AntdInput.Search;
  TextArea: typeof AntdInput.TextArea;
  Password: typeof AntdInput.Password;
};

const internalInput = (props: InputProps, ref: Ref<InputRef> | undefined) => {
  const { className, ...restProps } = props;

  const renderNode: RenderNode = (classes) => (
    <AntdInput
      ref={ref}
      className={classNames(classes, className)}
      {...restProps}
    />
  );

  return useElementWithStyle(props.prefixCls, renderNode);
};

const Input = forwardRef(internalInput) as CompoundedComponent;

Input.Group = AntdInput.Group;
Input.Search = AntdInput.Search;
Input.TextArea = AntdInput.TextArea;
Input.Password = AntdInput.Password;

export default Input;
export type { InputProps };
