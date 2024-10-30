import { src, dest } from "gulp";
import flog from "fancy-log";
import { parseArgs } from "./args";
import tinycolor from "tinycolor2";

const readEnv = (varname) => {
  return new Promise((resolve, reject) => {
    const value = process.env[varname];
    if (value) {
      resolve(value);
    } else {
      reject(new Error(`${varname} unset`));
    }
  });
};

/**
 * @type {Task}
 */
export const deployStyles = async () => {
  const sd = await readEnv("STYLED_BUILD_ROOT");
  const jekyllAssets = await readEnv("JEKYLL_ASSETS_DIR");
  // console.log("env: ", process.env);
  flog.info(`Copying styles: ${sd} --> ${jekyllAssets}`);
  return src(`${sd}/*`, { bash: true }).pipe(dest(jekyllAssets));
};
deployStyles.displayName = "deploy-styles";

export * from "./shades";
export * from "./convert";
export * from "./invert-color";
