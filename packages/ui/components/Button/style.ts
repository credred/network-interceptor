import { genUseElementWithStyle } from "../ConfigProvider";
import { genFocusStyleWithSelector } from "../style";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Button", (token) => {
  const { componentCls } = token;

  return [
    {
      [componentCls]: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...genFocusStyleWithSelector(token),
        [`&${componentCls}-text`]: {
          color: token.colorTextSecondary,
        },
        [`&${componentCls}-text:not(:disabled):hover`]: {
          backgroundColor: "initial",
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("btn", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
