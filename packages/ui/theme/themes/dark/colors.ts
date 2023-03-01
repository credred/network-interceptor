import { rgbToHsv, rgbToHex, inputToRGB } from "@ctrl/tinycolor";
import { generate } from "@ant-design/colors";
import { GenerateColorMap } from "antd/es/theme/themes/ColorMap";

interface HsvObject {
  h: number;
  s: number;
  v: number;
}

interface RgbObject {
  r: number;
  g: number;
  b: number;
}

// Wrapper function ported from TinyColor.prototype.toHsv
// Keep it here because of `hsv.h * 360`
function toHsv({ r, g, b }: RgbObject): HsvObject {
  const hsv = rgbToHsv(r, g, b);
  return { h: hsv.h * 360, s: hsv.s, v: hsv.v };
}

// Wrapper function ported from TinyColor.prototype.toHexString
// Keep it here because of the prefix `#`
function toHex({ r, g, b }: RgbObject): string {
  return `#${rgbToHex(r, g, b, false)}`;
}

// Wrapper function ported from TinyColor.prototype.mix, not treeshakable.
// Amount in range [0, 1]
// Assume color1 & color2 has no alpha, since the following src code did so.
function mix(rgb1: RgbObject, rgb2: RgbObject, amount: number): RgbObject {
  const p = amount / 100;
  const rgb = {
    r: (rgb2.r - rgb1.r) * p + rgb1.r,
    g: (rgb2.g - rgb1.g) * p + rgb1.g,
    b: (rgb2.b - rgb1.b) * p + rgb1.b,
  };
  return rgb;
}

// 暗色主题颜色映射关系表
const darkColorMap = [
  { index: 7, opacity: 0.3 },
  { index: 6, opacity: 0.35 },
  { index: 5, opacity: 0.45 },
  { index: 5, opacity: 0.55 },
  { index: 5, opacity: 0.65 },
  { index: 5, opacity: 0.85 },
  { index: 4, opacity: 0.9 },
  { index: 3, opacity: 0.95 },
  { index: 2, opacity: 0.97 },
  { index: 1, opacity: 0.98 },
];

export const generateColorPalettes: GenerateColorMap = (baseColor) => {
  const originColors = generate(baseColor);

  // dark theme patterns
  const colors = darkColorMap.map(({ index, opacity }) => {
    const darkColorString: string = toHex(
      mix(inputToRGB("#292a2d"), inputToRGB(originColors[index]), opacity * 100)
    );
    return darkColorString;
  });

  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],

    5: colors[6],
    6: colors[5],
    7: colors[4],

    8: colors[6],
    9: colors[5],
    10: colors[4],
    // 8: colors[9],
    // 9: colors[8],
    // 10: colors[7],
  };
};
