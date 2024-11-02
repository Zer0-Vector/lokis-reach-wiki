import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import("eslint").Linter.Config} */
const commonConfig = {
  name: "lrwiki-common",
  linterOptions: {
    reportUnusedDisableDirectives: "warn",
  },
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      ecmaFeatures: {
        impliedStrict: true,
        globalReturn: false,
      },
    },
  },
};

/** @type {import("eslint").Linter.Config} */
const webConfig = {
  name: "lrwiki-web",
  files: ["docs/**/*.{js,mjs,cjs}"],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      sourceType: "script",
    },
  },
};

/** @type {import("eslint").Linter.Config} */
const toolsConfig = {
  name: "lrwiki-tools",
  files: ["./*.{js,mjs}", "gulpfile.{js,esm.js}/**/*.{js,mjs}", "tokens/index.mjs"],
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parserOptions: {
      sourceType: "module",
    },
  },
};

export default [pluginJs.configs.recommended, commonConfig, toolsConfig, webConfig];
