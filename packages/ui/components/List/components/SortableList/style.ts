import { genUseElementWithStyle } from "../../../ConfigProvider";
import { genComponentStyleHook } from "../../../theme/internal";

const useStyle = genComponentStyleHook("SortableList", (token) => {
  const { componentCls } = token;

  const boxShadowBorder = `0 0 0 calc(1px / 1 rgba(63, 63, 68, 0.05)`;
  const boxShadowCommon = `0 1px calc(3px / 1 0 rgba(34, 33, 81, 0.15)`;
  const boxShadow = `${boxShadowBorder}, ${boxShadowCommon}`;

  return [
    {
      [`${componentCls}`]: {
        [`${componentCls}-item`]: {
          [`&-dragging:not(&-overlay)`]: {
            opacity: 0.5,
          },
          [`&-overlay`]: {
            background: token.colorBgElevated,
            ["&:hover"]: {
              background: token.colorBgElevated,
            },
          },

          [`&:focus`]: {
            boxShadow,
          },
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle("sortable-list", useStyle);

export default useElementWithStyle;
export type { RenderNode } from "../../../ConfigProvider";
