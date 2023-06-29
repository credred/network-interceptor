import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("ListCustom", (token) => {
  const { componentCls, customCls } = token;

  return [
    {
      [`${customCls}`]: {
        display: "flex",
        flexDirection: "column",

        [`${componentCls}-header, ${componentCls}-footer`]: {
          flexShrink: 0,
        },

        [`& > .ant-spin-nested-loading`]: {
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        },

        [`&-compact`]: {
          [`${componentCls}-header, ${componentCls}-footer`]: {
            padding: 0,
          },
        },
        [`${componentCls}-item`]: {
          padding: token.paddingSM,
          position: "relative",
          [`${componentCls}-selectable&`]: {
            cursor: "pointer",
          },
          "&:hover": {
            backgroundColor: token.controlItemBgHover,
          },
          "&-active": {
            backgroundColor: token.controlItemBgActive,
            "&:hover": {
              backgroundColor: token.controlItemBgActive,
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
