import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("TreeCustom", (token) => {
  const { componentCls, customCls } = token;

  return [
    {
      [`${customCls}-compact`]: {
        [`${componentCls}-node-content-wrapper`]: {
          lineHeight: `${token.controlHeightXS}px`,
          minHeight: "auto",
        },
        [`${componentCls}-switcher`]: {
          lineHeight: `${token.controlHeightXS}px`,
          width: `${token.controlHeightXS}px`,
        },
        [`${componentCls}-indent,`]: {
          height: 0,
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("tree", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
