import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Editor", (token) => {
  const { componentCls } = token;
  console.log("componentCls editor", componentCls);

  return [
    {
      [`${componentCls}`]: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",

        [`${componentCls}-flex`]: {
          flex: 1,
        },

        [`${componentCls}-core`]: {
          minHeight: 0,
          flex: 1,
        },
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
