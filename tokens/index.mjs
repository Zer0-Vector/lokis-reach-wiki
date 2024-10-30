import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dirs = dirpath => readdirSync(dirpath).filter(file => statSync(join(dirpath, file)).isDirectory());
// console.log("import.meta = ", import.meta);
export default dirs(import.meta.dirname);
