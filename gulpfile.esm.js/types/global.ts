import type { DestOptions } from "vinyl-fs";
import type { TaskFunction } from "gulp";
import type { Instance } from "tinycolor2";

declare global {

  namespace Swatches {
    interface CustomTaskOptions {
      prefix?: string;
      filename?: string;
    }
    type Options = DestOptions & CustomTaskOptions;
  }

  // tinycolor2
  type Color = Instance;
  type ColorFormat = Required<Parameters<Color["toString"]>>[0];

  // gulp
  type Task = TaskFunction;

}
