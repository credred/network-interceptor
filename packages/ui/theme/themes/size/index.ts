import { DerivativeFunc } from "@ant-design/cssinjs";
import { MapToken } from "antd/es/theme/interface";
import { SeedToken } from "antd/es/theme/internal";
import defaultAlgorithm from "antd/es/theme/themes/default";

const derivative: DerivativeFunc<SeedToken, MapToken> = (token, mapToken) => {
  const mergedMapToken = mapToken ?? defaultAlgorithm(token);

  const { sizeUnit, sizeStep } = token;

  return {
    ...mergedMapToken,
    sizeLG: sizeUnit * (sizeStep + 2),
  };
};

export default derivative;
