import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Editor", (token) => {
  const { componentCls } = token;
  console.log("componentCls editor", componentCls);

  return [
    {
      [`${componentCls}`]: {
        [`${componentCls}-toolbar`]: {
          backgroundColor: token.colorFillTertiary,
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("editor", useStyle, false);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
