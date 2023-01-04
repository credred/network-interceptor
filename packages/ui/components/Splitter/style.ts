import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme";

const useStyle = genComponentStyleHook("Splitter", (token) => {
  const { componentCls } = token;

  return [
    {
      [`${componentCls}`]: {
        [`${componentCls}-close-x`]: {
          fontSize: 16,
          lineHeight: "16px",
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("splitter", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
