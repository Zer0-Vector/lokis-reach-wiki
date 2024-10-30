import tinycolor from "tinycolor2";
import { parseArgs } from "./args";
import { info } from "fancy-log";

/** @type {Task} */
export const invert = async () => {
  const color = tinycolor(parseArgs("color").color[0]);
  flog.info("Base Color: ", color.toHexString(), color.toHslString());
  const comp = color.complement();
  console.log(comp.toHexString());
};
compliment.flags = {
  "--color=CSS_COLOR": "",
};

/** @type {Task} */
const invertTest = async () => {
  const args = parseArgs("color");
  const baseColor = tinycolor(args.color[0]);
  const rgbInverse = [baseColor.clone().toRgb()].map(({ r, g, b, a }) => {
    return tinycolor({ r: 255 - r, g: 255 - g, b: 255 - b, a });
  })[0];
  const hslInverse = baseColor.clone().spin(180);

  const print = (name, color) => {
    info(name);
    console.log(color.toHexString(), " - ", color.toHslString());
  };
  print("base", baseColor);
  print("rgb", rgbInverse);
  print("hsl", hslInverse);
  print("compliment", baseColor.complement());
};
invertTest.flags = {
  "--color=CSS_COLOR": "",
};
// export { invertTest };
