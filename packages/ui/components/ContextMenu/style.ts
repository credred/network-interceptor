import { genUseElementWithStyle } from "../ConfigProvider";
import { genComponentStyleHook } from "../theme/internal";

const useStyle = genComponentStyleHook("ContextMenu", (token) => {
  const { componentCls } = token;

  return [
    {
      ".contexify": {
        [`.contexify_itemContent_space`]: {
          [`.ant-space-item`]: {
            display: "flex",
          },
        },
      },
    },
  ];
});

const useElementWithStyle = genUseElementWithStyle(
  "context-menu",
  useStyle,
  false
);

export default useElementWithStyle;
export type { RenderNode } from "../ConfigProvider";
