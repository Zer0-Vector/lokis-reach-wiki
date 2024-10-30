import yaml from "yaml";
import tokens from "./tokens/index.mjs";

const buildRoot = process.env.STYLED_BUILD_ROOT || "build";

export default {
  hooks: {
    parsers: {
      "yaml-parser": {
        pattern: /\.yaml$/,
        parser: ({ contents }) => yaml.parse(contents),
      },
    },
  },
  parsers: ["yaml-parser"],
  source: ["tokens/**/*.yaml"],
  log: {
    verbosity: "verbose",
    errors: {
      brokenReferences: "console",
    },
  },
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: `${buildRoot}/css/`,
      transforms: ["color/hsl", "size/rem"],
      files: [
        ...tokens.map(tset => ({
          destination: `${tset}.css`,
          format: "css/variables",
          filter: {
            attributes: {
              category: tset,
            },
          },
          options: {
            outputReferences: true,
          },
        })),
      ],
    },
  },
};
