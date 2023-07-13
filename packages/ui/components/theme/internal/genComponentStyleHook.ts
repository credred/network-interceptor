/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useContext } from "react";
import { GlobalToken } from "antd";
import { genCommonStyle, genLinkStyle } from "antd/es/style";
import { ConfigContext } from "antd/es/config-provider";
import { OverrideToken } from "antd/es/theme/interface";
import {
  UseComponentStyleResult,
  mergeToken,
  useToken,
  statisticToken,
} from "antd/es/theme/internal";
import {
  FullToken,
  GlobalTokenWithComponent,
  OverrideComponent,
  OverrideTokenWithoutDerivative,
  StyleInfo,
  TokenWithCommonCls,
} from "antd/es/theme/util/genComponentStyleHook";
import { CSSInterpolation } from "@ant-design/cssinjs";
import { warning } from "rc-util";
import useStyleRegister from "./useStyleRegister";

type ComponentToken<ComponentName extends OverrideComponent> = Exclude<
  OverrideToken[ComponentName],
  undefined
>;
type ComponentTokenKey<ComponentName extends OverrideComponent> =
  keyof ComponentToken<ComponentName>;

export default function genComponentStyleHook<
  ComponentName extends OverrideComponent
>(
  component: ComponentName,
  styleFn: (
    token: FullToken<ComponentName>,
    info: StyleInfo<ComponentName>
  ) => CSSInterpolation,
  getDefaultToken?:
    | OverrideTokenWithoutDerivative[ComponentName]
    | ((token: GlobalToken) => OverrideTokenWithoutDerivative[ComponentName]),
  options?: {
    resetStyle?: boolean;
    // Deprecated token key map [["oldTokenKey", "newTokenKey"], ["oldTokenKey", "newTokenKey"]]
    deprecatedTokens?: [
      ComponentTokenKey<ComponentName>,
      ComponentTokenKey<ComponentName>
    ][];
  }
) {
  const storeComponentName = `x${component}`;
  return (prefixCls: string): UseComponentStyleResult => {
    const [theme, token, hashId] = useToken();
    const { getPrefixCls, iconPrefixCls, csp } = useContext(ConfigContext);
    const rootPrefixCls = getPrefixCls();

    // Shared config
    const sharedConfig: Omit<Parameters<typeof useStyleRegister>[0], "path"> = {
      //@ts-expect-error lib/theme not compatible es/theme
      theme,
      token,
      hashId,
      prepend: "queue",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      nonce: () => csp?.nonce!,
    };

    // Generate style for all a tags in antd component.
    useStyleRegister(
      { ...sharedConfig, reverseQueue: false, path: ["Shared", rootPrefixCls] },
      () => [
        {
          // Link
          "&": genLinkStyle(token),
        },
      ]
    );

    return [
      useStyleRegister(
        {
          ...sharedConfig,
          path: [storeComponentName, prefixCls, iconPrefixCls],
        },
        () => {
          const { token: proxyToken, flush } = statisticToken(token);

          const customComponentToken = {
            ...(token[component] as ComponentToken<ComponentName>),
          };
          if (options?.deprecatedTokens) {
            const { deprecatedTokens } = options;
            deprecatedTokens.forEach(([oldTokenKey, newTokenKey]) => {
              if (import.meta.env.DEV) {
                warning(
                  !customComponentToken?.[oldTokenKey],
                  `The token '${String(
                    oldTokenKey
                  )}' of ${component} had deprecated, use '${String(
                    newTokenKey
                  )}' instead.`
                );
              }

              // Should wrap with `if` clause, or there will be `undefined` in object.
              if (
                customComponentToken?.[oldTokenKey] ||
                customComponentToken?.[newTokenKey]
              ) {
                customComponentToken[newTokenKey] ??=
                  customComponentToken?.[oldTokenKey];
              }
            });
          }
          const defaultComponentToken =
            typeof getDefaultToken === "function"
              ? getDefaultToken(
                  mergeToken(proxyToken, customComponentToken ?? {})
                )
              : getDefaultToken;

          const mergedComponentToken = {
            ...defaultComponentToken,
            ...customComponentToken,
          };

          const componentCls = `.${prefixCls}`;
          const mergedToken = mergeToken<
            TokenWithCommonCls<GlobalTokenWithComponent<OverrideComponent>>
          >(
            proxyToken,
            {
              componentCls,
              prefixCls,
              iconCls: `.${iconPrefixCls}`,
              antCls: `.${rootPrefixCls}`,
            },
            mergedComponentToken
          );

          const styleInterpolation = styleFn(
            mergedToken as unknown as FullToken<ComponentName>,
            {
              hashId,
              prefixCls,
              rootPrefixCls,
              iconPrefixCls,
              overrideComponentToken: customComponentToken as any,
            }
          );
          flush(storeComponentName, mergedComponentToken);
          return [
            options?.resetStyle === false
              ? null
              : genCommonStyle(token, prefixCls),
            styleInterpolation,
          ];
        }
      ),
      hashId,
    ];
  };
}
