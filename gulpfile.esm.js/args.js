import { info } from "fancy-log";
import mini from "minimist";

const asArray = (maybeArray) => {
  return [maybeArray].flat();
};

/**
 * @param {string[]} [required = []]
 * @param {...string} optional
 * @returns {{ [key: string]: string[] }}
 */
export const parseArgs = (required = [], ...optional) => {
  const args = mini(process.argv.slice(2), { string: [...required, ...optional] });
  const keys = Object.getOwnPropertyNames(args);
  for (const key of keys.filter((k) => k !== "--" && k !== "_")) {
    info("with arg", { [key]: args[key] });
    args[key] = asArray(args[key]);
  }
  required.forEach((key) => {
    if (args[key] === undefined) {
      throw new Error(`at least one '--${key}' arg is required!`);
    }
  });
  return args;
};
