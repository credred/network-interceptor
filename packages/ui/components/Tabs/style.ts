import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("TabsCustom", (token) => {
  const { componentCls, customCls } = token;

  return [
    {
      [`${customCls}-full-height`]: {
        height: "100%",
        display: "flex",
        [`${componentCls}`]: {
          "&-content": {
            height: "100%",
          },
          "&-content-holder": {
            overflow: "auto",
          },
          "&-tabpane": {
            height: "100%",
          },
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("tabs", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
