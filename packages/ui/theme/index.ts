import { theme } from "antd";
import { AliasToken, DesignTokenContext } from "antd/es/theme/internal";
import type { Context } from "react";
import { createTheme } from "@ant-design/cssinjs";
import darkAlgorithm from "./themes/dark";
import sizeAlgorithm from "./themes/size";
type ContextType<T> = T extends Context<infer R> ? R : never;

const { defaultConfig } = theme as typeof theme & {
  defaultConfig: ContextType<typeof DesignTokenContext>;
};

(defaultConfig.token as AliasToken) = {
  ...(defaultConfig.token as AliasToken),
  colorBgBase: "#141414",
  colorPrimary: "#4ba3e3",
  borderRadius: 0,
};

defaultConfig.theme = createTheme([
  darkAlgorithm,
  theme.compactAlgorithm,
  sizeAlgorithm,
]);
