import genComponentStyleHook from "antd/es/theme/util/genComponentStyleHook";
import type { CSSInterpolation } from "@ant-design/cssinjs";
import type { GlobalToken } from "antd/es/theme/interface";
import type {
  FullToken,
  OverrideComponent,
  OverrideTokenWithoutDerivative,
  StyleInfo,
} from "antd/es/theme/util/genComponentStyleHook";

type InternalFullToken<ComponentName extends OverrideComponent> =
  FullToken<ComponentName> & {
    customCls: string;
  };

const genCustomComponentStyleHook = <ComponentName extends OverrideComponent>(
  component: `${ComponentName}Custom`,
  styleFn: (
    token: InternalFullToken<ComponentName>,
    info: StyleInfo<ComponentName>
  ) => CSSInterpolation,
  getDefaultToken?:
    | OverrideTokenWithoutDerivative[ComponentName]
    | ((token: GlobalToken) => OverrideTokenWithoutDerivative[ComponentName])
) => {
  const internalStyleFn = (
    token: FullToken<ComponentName>,
    info: StyleInfo<ComponentName>
  ) => {
    const { componentCls } = token;
    const customCls = `${componentCls}-custom${componentCls}`;
    return styleFn(
      { ...token, customCls } as any as InternalFullToken<ComponentName>,
      info
    );
    // return styleFn({ ...token, customCls }, info);
  };
  return genComponentStyleHook(
    // TODO: antd does not support override style
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    component as any,
    internalStyleFn,
    getDefaultToken
  );
};

export { genCustomComponentStyleHook };

export * from "antd/es/theme";
