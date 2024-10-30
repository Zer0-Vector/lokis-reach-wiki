import globals from "globals";
import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

/**
 * @typedef {import("eslint").Linter.Config} EslintConfig
 */

/** @type {EslintConfig} */
const commonConfig = {
  name: "lrwiki-common",
  linterOptions: {
    reportUnusedDisableDirectives: "warn",
    noInlineConfig: true,
  },
  parserOptions: {
    ecmaVersion: 6,
  },
}

/** @type {import("eslint").Linter.Config} */
const webConfig = {
  name: "lrwiki-web",
  files: ["docs/**/*.{js,mjs,cjs}"],
  languageOptions: {
    globals: {
      ...globals.browser
    }
  }
};

/** @type {import("eslint").Linter.Config} */
const toolsConfig = {
  name: "lrwiki-tools",
  files: ["*.{js,mjs,cjs}", "gulpfile.{js,esm.js}/**/*.{js,mjs,cjs}"],
  languageOptions: {
    globals: {
      ...globals.node
    }
  }
};

export default [
  pluginJs.configs.recommended,
  prettierConfig,
  commonConfig,
  toolsConfig,
  webConfig,
];
