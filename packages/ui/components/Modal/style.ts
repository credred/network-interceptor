import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Modal", (token) => {
  const { componentCls } = token;

  return [
    {
      [`${componentCls}-full-screen`]: {
        top: 0,
        maxWidth: "100%",
        padding: 0,
        height: "100%",

        [`${componentCls}-content`]: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          background: token.colorBgLayout,
        },
        [`${componentCls}-header`]: {
          padding: "10px",
          background: token.colorBgLayout,
        },
        [`${componentCls}-body`]: {
          minHeight: 0,
          flex: 1,
          overflow: "auto",
          padding: 0,
        },
      },
      [`${componentCls}`]: {
        [`${componentCls}-close-x`]: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("modal", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
