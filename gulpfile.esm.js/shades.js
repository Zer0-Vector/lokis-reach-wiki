import tinycolor from "tinycolor2";
import { parseArgs } from "./args";
import log from "fancy-log";
import { makeSwatches } from "./swatches";

const SHADES_DOMAIN = Object.freeze([10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99]);
const SHADES_UPPER_BOUND = 100;

/** @type {(n: number) => string} */
const floatAsString = (n) => n.toFixed(3);

/** @type {(n: number) => number} */
const round2places = (x) => Math.round(x * 100) / 100;

/**
 * @param {Color} color0
 * @return {{ [key: number]: Color}}
 */
const fitColorToScale = (color0) => {
  const hsl = color0.toHsl();
  log("Scaling ", color0.toHslString(), `(${color0.toHex8String()})`);

  const lightness = hsl.l * 100;
  const preimage = fitToDomain(lightness, SHADES_DOMAIN);

  console.assert(
    preimage.value === SHADES_DOMAIN[preimage.index],
    `*** preimage/domain value mismatch: ${preimage.value} != ${SHADES_DOMAIN[preimage.index]} ***`
  );
  log(
    `initial color fits at index ${preimage.index}: ${SHADES_DOMAIN[preimage.index]} -> ${lightness.toFixed(3)} (delta = ${preimage.diff.toFixed(3)})`
  );

  const linearMap = fitLine(lightness, preimage.value, SHADES_UPPER_BOUND);
  const range = SHADES_DOMAIN.map(val => linearMap(val));
  const image = linearMap(preimage.value);
  log(`orig ~ f(${preimage.index}) => ${lightness.toFixed(5)} ~ ${image.toFixed(5)}`);
  log(`deltaY = ${round2places(lightness - image)}`);

  return Object.fromEntries(range.map((image, index) => [SHADES_DOMAIN[index], tinycolor({ ...hsl, l: image * 0.01 })]));
};

/**
 * @type {import("gulp").TaskFunction}
 */
export const shades = async () => {
  const args = parseArgs(["color"], "prefix", "format");
  const color = tinycolor(args.color[0]);
  [
    `Base Color (50): ${color.toHexString()}`,
    color.toHslString(),
    "brightness: " + color.getBrightness(),
    "Luminance: " + color.getLuminance(),
  ].join("\n\t\t");
  const prefix = args.prefix ? args.prefix[0] : "";
  /** @type {ColorFormat} */
  // @ts-ignore
  const format = args.format ? args.format[0] : "hsl";
  // log(`Options: prefix='${prefix}' format='${format}'`);
  const results = fitColorToScale(color);

  for (const r in results) {
    console.log(`${prefix}${r}: ${results[r].toString(format)};`);
  }

  if (args.s) {
    const filename = `${prefix}swatches.svg`;
    /** @type {Swatches.Options} */
    const options = { overwrite: Object.getOwnPropertyNames(args).includes("force"), prefix, filename };
    options.overwrite && log("Overwriting swatches output file: ", filename);
    await makeSwatches(options, Object.values(results));
  }
};
shades.flags = {
  "--color=CSS_COLOR": "The base color used to generate shades",
  "[--prefix=PREFIX]": "The prefix for each shade in the output",
  "[--format=COLOR_FORMAT]": "The output format, 'hsl' by default",
  "[-s]": "output swatches svg",
};

const compose = (g, f) => {
  return (...args) => {
    // log("composing: args=", args);
    const gval = g(...args);
    // log("           gval=", gval, `(${g.name})`);
    const fval = f(...gval);
    // log("           fval=", fval, `(${f.name})`);
    return fval;
  };
};

/**
 * @template In
 * @template Out
 * @typedef {In extends any[] ? (...params: In) => Out : (param: In) => Out} BasicFunction
 */

/**
 * @param {number} y0
 * @param {number} x0
 * @param {number} max
 * @return {BasicFunction<number, number>}
 */
function fitLine(y0, x0, max) {
  log(`Fitting line to (${x0}, ${y0}); max=${max}`);
  const m = y0 / x0;
  /** @type {BasicFunction<number, [number, string]>} */
  let applySlope = (x) => {
    const y = m * x;
    // log("Applying slope: ", `${round2places(m)} * ${round2places(x)} = ${round2places(y)}`)
    return [y, `f(${x}) = ${floatAsString(m)}*x`];
  };

  const y1 = applySlope(max)[0];
  if (y1 > max) {
    const b = max - y1;
    log("Appending adjustment term: ", round2places(b));
    /** @type {BasicFunction<[number, string], [number, string]>} */
    const applyYIntercept = (...valMsg) => [valMsg[0] + b, valMsg[1] + ` + ${floatAsString(b)}`];
    applySlope = compose(applySlope, applyYIntercept);
  }
  /** @type {BasicFunction<[number, string], number>} */
  const tailLogger = (...valMsg) => {
    // log("logger params: ", valMsg);
    const yf = valMsg[0];
    log.info(valMsg[1] + ` = ${floatAsString(yf)}`, " (tailLog)");
    return yf;
  };

  return compose(applySlope, tailLogger);
}

/**
 * @param {number} image
 * @param {readonly number[]} range
 * @returns {{ index: number, value: number, diff: number }}
 */
function fitToDomain(image, range) {
  let index0 = -1;
  let leastDiff = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < range.length; i++) {
    const n = range[i];
    const diff = Math.abs(n - image);
    if (diff > leastDiff) {
      continue;
    }
    leastDiff = diff;
    index0 = i;
  }
  return { index: index0, diff: leastDiff, value: range[index0] };
}
