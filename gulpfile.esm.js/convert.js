import logger from "fancy-log";
import { parseArgs } from "./args.js";
import tinycolor from "tinycolor2";

/** @type {Task} */
export const convert = async () => {
  const args = parseArgs(["color", "format"]);
  const format = args.format[0].toLocaleLowerCase();
  // @ts-expect-error
  logger(tinycolor(args.color[0]).toString(format));
};
convert.flags = {
  "--color=CSS_COLOR": "The color to convert",
  "--format=(rgb|hsl|hex|...)": "Output color format",
};
