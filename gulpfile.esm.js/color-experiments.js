import { info } from "fancy-log";
import { parseArgs } from "./args";

function getRounder(precision) {
  const scale = Math.pow(10, precision);
  const rounder = (value) => {
    return Math.round(value * scale) / scale;
  };
  return rounder;
}

/**
 * @typedef {[number, number, number] | [number, number, number, number]} ColorVector
 */
/**
 * @typedef {"rgba" | "rgb" | "hsb" | "hsl"} ColorSpace
 */
/**
 * @typedef {() => ColorInfo} ColorConversion
 */

function asPercentage(n) {
  return n * 100.0;
}

class ColorInfo {
  /**
   * Number of decimal digits to use for alpha channel
   * @type {number}
   */
  static PRECISION = 3;
  static DEFAULT_ALPHA = 1.0;
  static get SATURATION_SPACES() {
    return ["hsv", "hsb", "hsl"];
  }
  // static get #ROUNDER() {
  //   return getRounder(ColorInfo.PRECISION);
  // }

  #round;
  #value;
  #lightness;
  #rgb255;
  #normalized;
  #nmin;
  #nmax;
  #saturation;
  #chroma;

  /**
   * @param {string} hex
   * @param {ColorVector} rgb RGB or RGBA vector.
   */
  constructor(hex, rgb) {
    this.hex = hex;
    /** @type {ColorVector} */
    this.#rgb255 = [...rgb.slice(0, 3)];
    const alpha = rgb.slice(3)[0];
    if (alpha - 1.0 < Number.EPSILON && alpha >= 0) {
      this.alpha = alpha;
    } else {
      this.alpha = ColorInfo.DEFAULT_ALPHA;
    }
    const round = getRounder(ColorInfo.PRECISION);
    this.#round = round;
    this.#normalized = this.#rgb255.map((v) => v / 255.0);
    this.#nmin = Math.min(...this.#normalized);
    this.#nmax = Math.max(...this.#normalized);
    this.#value = this.#nmax;
    this.#chroma = this.#value - this.#nmin;
    this.value = round(asPercentage(this.#value));
    this.#lightness = this.#value - this.#chroma / 2.0;
    this.lightness = round(asPercentage(this.#lightness));
    this.brigtness = this.value;
    this.red = this.#rgb255[0];
    this.green = this.#rgb255[1];
    this.blue = this.#rgb255[2];

    /**
     * @param {"hsb" | "hsv" | "hsl"} space Target color space
     */
    this.#saturation = (space) => {
      switch (space) {
        case "hsb":
        case "hsv":
          if (this.#value > Number.EPSILON) {
            return this.#chroma / this.#value;
          }
          return 0;
        case "hsl":
          // console.log("computing hsl['s']: lightness, value --> ", this.#lightness, this.#value);
          if (this.#lightness <= Number.EPSILON || this.#lightness >= 1.0) {
            return 0.0;
          } else {
            return (this.#value - this.#lightness) / Math.min(this.#lightness, 1.0 - this.#lightness);
          }
        default:
          throw new Error(`Invalid color space for saturation: ${space}`);
      }
    };

    this.hue = (() => {
      let h = 0;
      //    console.log("compute hue");
      //    console.log("normalized rgb: ", this.#normalized);
      const [r, g, b] = this.#normalized;

      //    console.log("#value=", this.#value);
      //    console.log("#chroma=", this.#chroma);
      if (this.#chroma <= Number.EPSILON) {
        return 0;
      }
      //    console.log("nonzero hue");
      if (Math.abs(this.#value - r) <= Number.EPSILON) {
        //      console.log("red! ", this.#value, r, this.#value - r, Number.EPSILON);
        h = g - b;
        //      console.log("g - b", h);
        h /= this.#chroma;
        //      console.log(" /= c", h);
        if (h < 0) {
          h += 6;
          //        console.log(" += 6", h);
        }
      } else if (Math.abs(this.#value - g) <= Number.EPSILON) {
        //      console.log("green! ", this.#value, g);
        h = b - r;
        //      console.log("  b-r", h);
        h /= this.#chroma;
        //      console.log("  /=c", h);
        h += 2;
        //      console.log("  +=2", h);
      } else if (Math.abs(this.#value - b) <= Number.EPSILON) {
        //      console.log("blue! ", this.#value, b);
        h = r - g;
        //      console.log("  r-g", h);
        h /= this.#chroma;
        //      console.log("  /=c", h);
        h += 4;
        //      console.log("  +=4", h);
      }
      h *= 60;
      //    console.log("     ", h);
      return h;
    })();
    return Object.freeze(this);
  }

  get rgb() {
    return [...this.#rgb255];
  }

  get hsv() {
    return [this.hue, this.saturations.hsv, this.value].map(this.#round);
  }

  get hsb() {
    return this.hsv;
  }

  get hsl() {
    // console.log("in 'get hsl()': ", this);
    return [this.hue, this.saturations.hsl, this.lightness].map(this.#round);
  }

  get saturations() {
    return ColorInfo.SATURATION_SPACES.map(this.#saturation)
      .map(asPercentage)
      .map(this.#round)
      .reduce((out, value, index) => ({ ...out, [ColorInfo.SATURATION_SPACES[index]]: value }), {});
  }

  get spaces() {
    return { hex: this.hex, rgb: this.rgb, hsl: this.hsl, hsv: this.hsv };
  }

  toString() {
    return JSON.stringify(this.spaces, null, 2);
  }

  static #HEX_COLOR_REGEX = /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?/i;

  /**
   * @param {string | number} hex
   * @returns {ColorInfo}
   */
  static fromHex(hex) {
    const vector = (() => {
      switch (typeof hex) {
        case "number":
          //        console.log("num");
          return hex.toString();
        case "string":
          //        console.log("str");
          return hex.trim().slice(hex.startsWith("#") ? 1 : 0); // remove "#" prefix
        default:
          throw new Error(`Invalid type for ColorInfo.fromHex: ${hex} [${typeof hex}]`);
      }
    })()
      .match(ColorInfo.#HEX_COLOR_REGEX) // grab each pair of hex digits
      .slice(1)
      .filter((b) => !!b)
      .map((n, i) => {
        if (i > 3) {
          return undefined;
        }
        return i < 3 ? Number.parseInt(n, 16) : Number.parseInt(n, 16) / 255.0;
      });

    //  console.log("Mapped hex: ", hex, vector);
    return new ColorInfo(hex, vector);
  }
}

/**
 * @param {string | [string, string, ...any]} argv
 * @returns {[ColorInfo] | [ColorInfo, ColorInfo]}
 */
function parseColors(argv) {
  if (typeof argv === "string" || typeof argv === "number") {
    return [ColorInfo.fromHex(argv)];
  } else if (Array.isArray(argv)) {
    return argv.map(ColorInfo.fromHex);
  } else {
    throw new Error(`Invalid type for parseColors: ${argv} [${typeof argv}]`);
  }
}

export async function convert() {
  parseColors(parseArgs().color).forEach((c) => info(c.toString()));
}

function getInitialShade(vl) {
  if (vl < Number.EPSILON) {
    return 0;
  }
  if (Math.abs(vl - 100) < Number.EPSILON) {
    return 100;
  }
  const round = getRounder(-1);
  const s = round(vl);
  if (s < 90) {
    return s;
  }
  if (vl < 92.5) {
    return 90;
  } else if (vl < 97.5) {
    return 95;
  } else {
    return 99;
  }
}

/**
 * @type {import("gulp").TaskFunction}
 */
export async function computeShades() {
  const colors = parseColors(parseArgs().color);
  // info(colors);
  const roundColor = getRounder(ColorInfo.PRECISION);
  if (colors.length === 1) {
    const [color] = colors;
    const [h, s, l] = color.hsl;
    const shadeInitial = getInitialShade(l);
    const shift = l - shadeInitial;
    info("lightness: ", l);
    info("initial shade: ", shadeInitial);
    info("shift: ", roundColor(shift));
    const shades = { color: { hex: color.hex, hsl: color.hsl } };
    shades[0] = "black";
    shades[100] = "white";
    shades[shadeInitial] = color.hsl;
    const leftStepDist = shadeInitial / 10;
    const leftStep = l / leftStepDist;
    const rightStepDist = (90 - shadeInitial) / 10 + 1;
    const rightStep = (100 - l) / rightStepDist;
    info("step dists: ", leftStepDist, rightStepDist);
    info("steps: ", leftStep, rightStep);
    let step = leftStep;
    let val = leftStep;
    for (let shl = 10; shl < 90; shl += 10) {
      if (shl === shadeInitial) {
        step = rightStep;
        val = l + rightStep;
        continue;
      }
      shades[shl] = [h, s, roundColor(val)];
      val += step;
    }
    shades[90] = roundColor(val);
    const topstep = (100 - val) / 10;
    shades[95] = roundColor(val + 5 * topstep);
    shades[99] = roundColor(val + 9 * topstep);

    info("shades:\n", JSON.stringify(shades, null, 2));
  }
}

computeShades.displayName = "compute-shades";
