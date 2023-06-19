import React from "react";
import {
  useFieldArray,
  UseFieldArrayProps,
  UseFieldArrayReturn,
  useFormContext,
} from "react-hook-form";

export interface ArrayFieldProps extends UseFieldArrayProps {
  // render: (getName: (suffix: string) => string, id: string, index: number) => React.ReactElement;
  children: (
    fields: { id: string; getName: (suffix: string) => string }[],
    actions: Omit<UseFieldArrayReturn, "fields">
  ) => React.ReactElement;
}

const ArrayField: React.FC<ArrayFieldProps> = (props) => {
  const methods = useFormContext();
  const { name, control = methods.control, children, ...arrayProps } = props;
  const { fields, ...actions } = useFieldArray({
    name,
    control,
    ...arrayProps,
  });
  const newFeilds = fields.map(({ id }, index) => ({
    id,
    getName: (suffix: string) => `${name}.${index}.${suffix}`,
  }));
  return children(newFeilds, actions);
};

export default ArrayField;
