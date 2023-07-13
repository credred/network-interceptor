import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Table", (token) => {
  const { componentCls, antCls } = token;

  return [
    {
      [`${componentCls}-wrapper-full-height`]: {
        height: "100%",
        [`${componentCls}`]: {
          height: "100%",
          "&-container": {
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
          "&-body": {
            flex: "1 1",
          },
        },
        [`${antCls}-spin`]: {
          "&-nested-loading": {
            height: "100%",
          },
          "&-container": {
            height: "100%",
          },
        },
      },
      [`${componentCls}`]: {
        [`${componentCls}-placeholder`]: {
          display: "none",
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("table", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
