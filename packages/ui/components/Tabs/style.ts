import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("TabsCustom", (token) => {
  const { componentCls, customCls } = token;

  const tabCls = `${componentCls}-tab`;

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
      [customCls]: {
        [`${tabCls}`]: {
          padding: `${token.sizeXS}px ${token.sizeSM}px`,
          [`&:hover`]: {
            background: token.colorBgTextHover,
          },
          [`&-active`]: {
            background: token.colorPrimaryBg,
          },
          [`&-active:hover`]: {
            background: token.colorPrimaryBg,
          },
        },
        [`${tabCls} + ${tabCls}`]: {
          margin: {
            _skip_check_: true,
            value: `0`,
          },
        },
        [`&-compact > ${componentCls}-nav`]: {
          margin: 0,
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("tabs", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
