import tinycolor from "tinycolor2";
import log from "fancy-log";
import { parseArgs } from "./args.js";

/** @type {Task} */
export const desaturate = async () => {
  const args = parseArgs(["color", "factor"], "op", "format");
  const hsl = tinycolor(args.color[0]).toHsl();
  const factor = Number.parseFloat(args.factor[0]);
  /** @type {ColorFormat} */
  // @ts-expect-error
  const format = args.format ? args.format[0] : "hex8";

  /** @type {"scale" | "shift" | string} */
  const op = args.op ? args.op[0] : "scale";
  let result = null;
  switch (op) {
    case "scale":
      result = tinycolor({ ...hsl, l: factor * hsl.l });
      break;
    case "shift":
      result = tinycolor({ ...hsl, l: Math.min(hsl.l - factor, 0) });
      break;
    default:
      throw new Error(`Unknown op: ${op}`);
  }

  log(result.toString(format));
};

desaturate.flags = {
  "--color=CSS_COLOR": "",
  "[--factor=FACTOR]": "default: scale=0.5",
  "[--op=scale|shift]": "default: scale",
  "[--format=COLOR_FORMAT]": "default: hex8",
  "[-s]": "output swatches svg",
}
