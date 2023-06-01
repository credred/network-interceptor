import { forwardRef, Ref } from "react";
import { InputNumber as AntdInputNumber, InputNumberProps } from "antd";
import { valueType } from "antd/es/statistic/utils";
import { num2str, trimNumber } from "@rc-component/mini-decimal";

type CompoundedComponent = (<T extends valueType = valueType>(
  props: React.PropsWithChildren<InputNumberProps<T>> & {
    ref?: React.Ref<HTMLInputElement>;
  }
) => React.ReactElement) & {
  displayName?: string;
};

const internalInputNumber = (
  props: InputNumberProps,
  ref: Ref<HTMLInputElement> | undefined
) => {
  const { precision, formatter, ...restProps } = props;
  let mergedFormatter = formatter;
  if (precision && !formatter) {
    mergedFormatter = (value, info) => {
      if (!value) return "";
      const str = typeof value === "number" ? num2str(value) : value;
      if (info.userTyping) return str;
      const separatorStr = props.decimalSeparator || ".";
      const { negativeStr, integerStr, decimalStr } = trimNumber(str);
      const mergedSeparatorAndDecimal =
        decimalStr === "0"
          ? ""
          : `${separatorStr}${decimalStr.slice(0, precision)}`;
      return `${negativeStr}${integerStr}${mergedSeparatorAndDecimal}`;
    };
  }

  return (
    <AntdInputNumber ref={ref} formatter={mergedFormatter} {...restProps} />
  );
};

const InputNumber = forwardRef(internalInputNumber) as CompoundedComponent;

InputNumber.displayName = "InputNumber";

export type { InputNumberProps };

export default InputNumber;
