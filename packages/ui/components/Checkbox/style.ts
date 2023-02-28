import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("CheckboxCustom", (token) => {
  const { customCls, componentCls } = token;

  return [
    {
      [`${customCls}-wrapper`]: {
        alignItems: "center",
        [`${componentCls}`]: {
          top: 0,
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("checkbox", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
