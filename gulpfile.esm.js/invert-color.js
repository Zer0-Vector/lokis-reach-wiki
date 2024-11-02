import tinycolor from "tinycolor2";
import { parseArgs } from "./args.js";
import logger from "fancy-log";

/** @type {Task} */
export const invert = async () => {
  const color = tinycolor(parseArgs(["color"]).color[0]);
  logger.info("Base Color: ", color.toHexString(), color.toHslString());
  const comp = color.complement();
  console.log(comp.toHexString());
};
invert.flags = {
  "--color=CSS_COLOR": "",
};
