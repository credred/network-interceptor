import { useCallback, useContext } from "react";
import { ConfigProvider } from "antd";

export const usePrefixCls = (
  namespace: string,
  customizePrefixCls?: string
) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls(namespace, customizePrefixCls);

  const genCls = useCallback(
    (suffix = "") => (suffix ? `${prefixCls}-${suffix}` : prefixCls),
    [prefixCls]
  );

  const customCls = genCls("custom");

  return { prefixCls, genCls, getPrefixCls, customCls };
};
