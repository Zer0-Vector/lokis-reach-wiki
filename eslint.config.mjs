import pluginJs from "@eslint/js";

/** @type {import("eslint").Linter.Config} */
const commonConfig = {
  name: "lrwiki-common",
  linterOptions: {
    reportUnusedDisableDirectives: "warn",
  },
  languageOptions: {
    globals: {
      console: true,
    },
    parserOptions: {
      ecmaVersion: 2022,
    },
  },
};

/** @type {import("eslint").Linter.Config} */
const webConfig = {
  name: "lrwiki-web",
  files: ["docs/**/*.js"],
  languageOptions: {
    globals: {
      document: true,
      window: true,
      URL: true,
      URLSearchParams: true,
      MouseEvent: true,
    },
    parserOptions: {
      sourceType: "script",
    },
  },
};

/** @type {import("eslint").Linter.Config} */
const toolsConfig = {
  name: "lrwiki-tools",
  files: ["*.mjs", "*.js", "gulpfile.esm.js/*.js", "tokens/index.mjs"],
  languageOptions: {
    globals: {
      process: true,
    },
    parserOptions: {
      sourceType: "module",
    },
  },
};

export default [pluginJs.configs.recommended, commonConfig, toolsConfig, webConfig];
