import classNames from "classnames";

type Customizer = (objValue: any, srcValue: any, key: string) => any;

const baseMerge = (
  targetObj: Record<string, any>,
  sourceObj: Record<string, any>,
  customizer: Customizer
) => {
  for (const key in sourceObj) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    targetObj[key] =
      customizer(targetObj[key], sourceObj[key], key) ?? sourceObj[key];
  }
  return targetObj;
};

const propsMergeCustomzer: Customizer = (objValue, srcValue, key) => {
  if (typeof objValue === "function" && typeof srcValue === "function")
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      objValue();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      srcValue();
    };
  if (key === "className") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return classNames(objValue, srcValue);
  }
  if (key === "style") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...objValue, ...srcValue };
  }
};

export const mergeProps = (
  source1: Record<string, any>,
  ...sources: Record<string, any>[]
) => {
  return sources.reduce((resultObj, source) => {
    return baseMerge(resultObj, source, propsMergeCustomzer);
  }, source1);
};
