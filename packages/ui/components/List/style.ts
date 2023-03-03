import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("ListCustom", (token) => {
  const { componentCls, customCls } = token;

  return [
    {
      [`${customCls}`]: {
        [`&-compact`]: {
          [`${componentCls}-header, ${componentCls}-footer`]: {
            padding: 0,
          },
        },
        [`${componentCls}-item`]: {
          padding: 8,
          position: "relative",
          [`${componentCls}-selectable&`]: {
            cursor: "pointer",
          },
          "&-active": {
            backgroundColor: token.controlItemBgActive,
            "&:hover": {
              backgroundColor: token.controlItemBgActiveHover,
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
