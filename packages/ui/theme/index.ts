import { theme } from "antd";
import { createTheme } from "@ant-design/cssinjs";
import type { Context } from "react";
import darkAlgorithm from "./themes/dark";
import sizeAlgorithm from "./themes/size";
import { DesignTokenContext } from "antd/es/theme/internal";
type ContextType<T> = T extends Context<infer R> ? R : never;

const { defaultConfig } = theme;

defaultConfig.token.colorBgBase = "#141414";
defaultConfig.token.colorPrimary = "#4ba3e3";
defaultConfig.token.borderRadius = 0;

(defaultConfig as ContextType<typeof DesignTokenContext>).components = {};

(defaultConfig as ContextType<typeof DesignTokenContext>).theme = createTheme([
  darkAlgorithm,
  theme.compactAlgorithm,
  sizeAlgorithm,
]);
