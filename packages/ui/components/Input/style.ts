import { genUseElementWithStyle } from "../ConfigProvider";
import { genCustomComponentStyleHook } from "../theme";

const useStyle = genCustomComponentStyleHook("InputCustom", (token) => {
  const { customCls, componentCls } = token;

  return [
    {
      [customCls]: {
        [`&-affix-wrapper`]: {
          [`${componentCls}-clear-icon`]: {
            display: "flex",
          },
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("input", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
