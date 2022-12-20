import { CSSObject } from "@ant-design/cssinjs";
import { DerivativeToken } from "antd/es/theme/internal";

export const genFocusStyle = (token: DerivativeToken): CSSObject => ({
  background: token.colorPrimaryActive,
  outline: "none",
  outlineOffset: 1,
  transition: "outline-offset 0s, outline 0s",
});

export const genFocusStyleWithSelector = (
  token: DerivativeToken
): CSSObject => ({
  "&:not(:disabled):focus-visible": {
    ...genFocusStyle(token),
  },
});
