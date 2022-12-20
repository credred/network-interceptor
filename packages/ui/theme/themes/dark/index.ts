import { generate } from "@ant-design/colors";
import type { DerivativeFunc } from "@ant-design/cssinjs";
import type {
  ColorPalettes,
  MapToken,
  PresetColorType,
  SeedToken,
} from "antd/es/theme/interface";
import { defaultPresetColors } from "antd/es/theme/themes/seed";
import genColorMapToken from "antd/es/theme/themes/shared/genColorMapToken";
import { generateNeutralColorPalettes } from "antd/es/theme/themes/dark/colors";
import defaultAlgorithm from "antd/es/theme/themes/default";
import { generateColorPalettes } from "./colors";

const darkAlgorithm: DerivativeFunc<SeedToken, MapToken> = (
  token,
  mapToken
) => {
  const colorPalettes = (
    Object.keys(defaultPresetColors) as (keyof PresetColorType)[]
  )
    .map((colorKey) => {
      const colors = generate(token[colorKey], { theme: "dark" });

      return new Array(10)
        .fill(1)
        .reduce<Partial<ColorPalettes>>((prev, _, i) => {
          prev[`${colorKey}-${i + 1}` as keyof ColorPalettes] = colors[i];
          return prev;
        }, {}) as ColorPalettes;
    })
    .reduce((prev, cur) => {
      prev = {
        ...prev,
        ...cur,
      };
      return prev;
    }, {} as ColorPalettes);

  const mergedMapToken = mapToken ?? defaultAlgorithm(token);

  return {
    ...mergedMapToken,

    // Dark tokens
    ...colorPalettes,
    // Colors
    ...genColorMapToken(token, {
      generateColorPalettes,
      generateNeutralColorPalettes,
    }),
    override: {
      controlItemBgActive: "red",
    },
  };
};

export default darkAlgorithm;
