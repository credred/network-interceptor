import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Input", (token) => {
  const { componentCls } = token;

  return [
    {
      [componentCls]: {
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
