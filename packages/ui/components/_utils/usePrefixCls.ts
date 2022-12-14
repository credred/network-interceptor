import { useContext } from "react";
import { ConfigProvider } from "antd";

export const usePrefixCls = (
  namespace: string,
  customizePrefixCls?: string
) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls(namespace, customizePrefixCls);

  const genCls = (suffix = "") => `${prefixCls}-${suffix}`;

  const customCls = genCls("custom");

  return { prefixCls, genCls, getPrefixCls, customCls };
};
