import React from "react";
import { CSSInterpolation, useEmotionCss } from "@ant-design/use-emotion-css";
import classNames from "classnames";
import { isHttpMethod } from "common/utils";
import { METHOD } from "common/models/rule.model";
import { GlobalToken } from "ui";

export interface HttpBadgeProps {
  value: string;
}

const getHttpColors = (
  token: GlobalToken
): Record<keyof typeof METHOD | "UNKNOWN", string> => ({
  ALL: token["magenta-7"],
  GET: token["blue-7"],
  POST: token["green-7"],
  PUT: token["gold-7"],
  DELETE: token["red-7"],
  HEAD: token["purple-7"],
  PATCH: token["lime-7"],
  OPTIONS: token["cyan-7"],
  UNKNOWN: token["volcano-7"],
});

const useStyles = () => {
  return useEmotionCss(({ token }) => {
    const httpColors = getHttpColors(token);
    return {
      ["&.networkRules-http-badge"]: {
        ...Object.keys(httpColors).reduce<Record<string, CSSInterpolation>>(
          (styles, key) => ({
            ...styles,
            [`&-${key}`]: {
              color: httpColors[key as keyof typeof METHOD | "UNKNOWN"],
            },
          }),
          {}
        ),
      },
    };
  });
};

const HttpBadge: React.FC<HttpBadgeProps> = ({ value }) => {
  const classes = useStyles();
  const httpType = isHttpMethod(value) ? value : "UNKNOWN";
  return (
    <span
      className={classNames(
        "networkRules-http-badge",
        `networkRules-http-badge-${httpType}`,
        classes
      )}
    >
      {value}
    </span>
  );
};

export default HttpBadge;
