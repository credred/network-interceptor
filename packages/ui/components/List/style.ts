import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("ListCustom", (token) => {
  const { componentCls, customCls } = token;

  return [
    {
      [`${customCls}`]: {
        [`${componentCls}-item`]: {
          padding: 8,
          position: "relative",
          [`${componentCls}-selectable&`]: {
            cursor: "pointer",
          },
          "&-active": {
            backgroundColor: token.colorFill,
            "&::before": {
              content: "' '",
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "2px",
              background: token.controlItemBgActive,
            },
          },
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("list", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
