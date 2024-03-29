import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("Collapse", (token) => {
  const { componentCls } = token;

  return [
    {
      [componentCls]: {
        [`&${componentCls}-ghost`]: {
          [`& > ${componentCls}-item`]: {
            [`& > ${componentCls}-header`]: {
              display: "flex",
              alignItems: "center",
              height: 26,
              padding: `0 0 0 ${token.paddingXXS}px`,
              userSelect: "none",

              [`${componentCls}-expand-icon`]: {
                paddingInlineEnd: `${token.paddingXXS}px`,
              },

              [`${componentCls}-header-text`]: {
                fontWeight: "bold",
              },
            },
            [`${componentCls}-content`]: {
              [`& > ${componentCls}-content-box`]: {
                padding: `0 0 ${token.paddingSM}px ${token.paddingLG}px`,
              },
            },
          },
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("collapse", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
