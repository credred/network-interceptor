import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Tree", (token) => {
  const { componentCls } = token;

  return [
    {
      [`${componentCls}`]: {
        background: "transparent",
      },
      [`${componentCls}-compact`]: {
        [`${componentCls}-node-content-wrapper`]: {
          lineHeight: `${token.controlHeightXS}px`,
          minHeight: "auto",
        },
        [`${componentCls}-switcher`]: {
          lineHeight: `${token.controlHeightXS}px`,
          width: `${token.controlHeightXS}px`,
        },
        [`${componentCls}-indent`]: {
          height: 0,
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("tree", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
