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
        ...genFocusStyleWithSelector(token),

        [`&${componentCls}-text:not(:disabled):hover`]: {
          backgroundColor: "initial",
          color: "#fff",
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("btn", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
