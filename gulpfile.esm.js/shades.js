import tinycolor from "tinycolor2";
import { parseArgs } from "./args";
import flog from "fancy-log";

/**
 * @typedef {import("tinycolor2").Instance} TinyColor
 */

const KEYS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99];

/**
 * @param {TinyColor} color0
 * @return {{ [key: number]: TinyColor}}
 */
const scaleLightness2 = (color0) => {
  const hsl = color0.toHsl();
  const initial = hsl.l;
  const scale1 = initial / 50.0;
  const results = [];
  const index50 = 4;
  const index90 = 8;
  // flog.info("scale1 = ", scale1);
  for (const k of KEYS.slice(0, index50)) {
    results.push([k, k * scale1]);
  }
  results.push([50, initial]);
  // 0.9 maps to 1.0-results[0]
  const scale2 = (1.0 - results[0][1] - initial) / 40.0;
  // flog.info("scale2 = ", scale2);
  for (const k of KEYS.slice(index50 + 1, index90 + 1)) {
    results.push([k, initial + (k - 50) * scale2]);
  }
  let scale3 = (1.0 - results[index90][1]) / 10.0;
  let i = index90;
  for (; scale3 > 1.0 || Math.abs(scale3 - 1.0) < Number.EPSILON; i--) {
    // flog.info(`scale3 won't work: ${scale3}`);
    scale3 = (1.0 - results[i][1]) / (100.0 - KEYS[i]);
  }
  // flog.info("scale3 = ", scale3, i);
  const refKey = i; // incrementing to start after this key
  for (const k of KEYS.slice(refKey + 1)) {
    const entry = [k, results[refKey][1] + scale3 * (k - KEYS[refKey])];
    // flog.info(entry);
    results.push(entry);
  }
  // flog.info("entries: ", results);
  const entries = results.map((e) => [e[0], tinycolor({ ...hsl, l: e[1] })]);
  return Object.fromEntries(entries);
};

/**
 * @type {import("gulp").TaskFunction}
 */
export const shades = async () => {
  const args = parseArgs("color");
  const color = tinycolor(args.color[0]);
  flog.info("Base Color (50): ", color.toHexString(), color.toHslString(), color.getBrightness(), color.getLuminance());
  const results = scaleLightness2(color);
  let prefix = args.prefix || "";
  for (const r in results) {
    console.log(`${prefix}${r}: ${results[r].toHslString()};`);
  }
};
shades.flags = {
  "--color=CSS_COLOR": "The base color used to generate shades",
  "[--prefix=PREFIX]": "The prefix for each shade in the output",
};
