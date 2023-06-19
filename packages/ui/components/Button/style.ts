import { genUseElementWithStyle } from "../ConfigProvider";
import { genFocusStyleWithSelector } from "../style";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("ButtonCustom", (token) => {
  const { customCls, componentCls } = token;

  return [
    {
      [customCls]: {
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
