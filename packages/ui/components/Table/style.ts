import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("TableCustom", (token) => {
  const { componentCls, customCls, antCls } = token;

  return [
    {
      [`${customCls}-wrapper-full-height`]: {
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
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("table", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
