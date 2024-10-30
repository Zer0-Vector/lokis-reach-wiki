import { info, warn } from "fancy-log";
import { parseArgs } from "./args";
import tinycolor from "tinycolor2";

/** @type {Task} */
export const convert = async () => {
  const args = parseArgs("color", "format");
  const format = args.format[0].toLocaleLowerCase();
  console.log(tinycolor(args.color[0]).toString(format));

  // info("Format: ", format);

  // const func = format === "prgb" ? "toPercentageRgbString" : `to${format[0].toLocaleUpperCase()}${format.slice(1)}String`;
  // info("Function: ", func);

  // /** @type {Function} */
  // const converter = color[func];
  // if (converter) {
  //   warn(converter.name);
  //   console.log(converter());
  // } else {
  //   throw new Error(`'${format}' is an invalid format.`);
  // }
};
convert.flags = {
  "--color=CSS_COLOR": "The color to convert",
  "--format=(rgb|hsl|hex|...)": "Output color format",
};
