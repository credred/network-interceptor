import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Checkbox", (token) => {
  const { componentCls } = token;

  return [
    {
      [`${componentCls}-wrapper`]: {
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
