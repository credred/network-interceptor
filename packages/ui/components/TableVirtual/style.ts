import { TinyColor } from "@ctrl/tinycolor";
import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("TableVirtual", (token) => {
  const { componentCls, antCls } = token;
  const tableCls = `${antCls}-table`;
  const tableBorder = `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`;

  const colorFillAlterSolid = new TinyColor(token.colorFillAlter)
    .onBackground(token.colorBgContainer)
    .toHexShortString();

  return [
    {
      [`${componentCls}-wrapper`]: {
        [`${componentCls}-cell`]: {
          position: "relative",
          padding: `${token.paddingContentVerticalLG}px ${token.padding}px`,
          borderBottom: tableBorder,
          overflowWrap: "break-word",

          ["&-hover"]: {
            background: colorFillAlterSolid,
          },
        },
        [`${componentCls}-row-selected`]: {
          background: token.controlItemBgActive,

          ["&-hover"]: {
            background: colorFillAlterSolid,
          },
        },
        // Size
        [`${tableCls}-small`]: {
          [`${componentCls}-cell`]: {
            padding: `${token.paddingXS}px ${token.paddingXS}px`,
          },
        },
        [`${tableCls}-middle`]: {
          [`${componentCls}-cell`]: {
            padding: `${token.paddingSM}px ${token.paddingXS}px`,
          },
        },
        [`${tableCls}-large`]: {
          [`${componentCls}-cell`]: {
            padding: `${token.paddingMD}px ${token.paddingSM}px`,
          },
        },
        // Border
        [`${tableCls}-bordered`]: {
          [`${componentCls}-cell`]: {
            borderInlineEnd: tableBorder,
          },
        },
        // Text
        [`${componentCls}-cell-ellipsis`]: {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          wordBreak: "keep-all",
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("table-virtual", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
