import logger from "fancy-log";
import { dest, src } from "gulp";
import Handlebars from "handlebars";
import through2 from "through2";
import Vinyl from "vinyl";

/**
 * @param {Swatches.Options} options
 * @param {Color[]} colors
 */
export const makeSwatches = async (options, colors) => {
  const templatePath = "swatches.svg.handlebars";

  logger.info("Generating swatches...");
  const destinationFolder = "./swatches";
  src([templatePath])
    .pipe(
      through2.obj(
        /** @type {import("through2").TransformFunction} */
        (file, _enc, cb) => {
          if (file.isNull() || !file.isBuffer()) {
            console.error("the file is " + (file.isNull() ? "null" : "not a buffer") + "!!!");
            cb(null, file);
            return;
          }
          Handlebars.registerPartial("attributes", (/** @type {{ [x: string]: any; }} */ map) =>
            Object.getOwnPropertyNames(map)
              .map((val) => `${val}="${map[val]}"`)
              .join(" ")
          );
          const template = Handlebars.compile(file.contents.toString());
          const outfile = new Vinyl({
            path: options.filename || "swatches.svg",
            contents: Buffer.from(template(createSwatchData(colors.map((c) => c.toString("hex"))))),
          });
          cb(null, outfile);
        }
      )
    )
    .pipe(dest(destinationFolder, { overwrite: false, ...options }));
};

/**
 * @typedef SwatchData
 * @property {BoxProps} svg
 * @property {SwatchesRow[]} rows
 */

/**
 * @typedef SwatchesRow
 * @property {SvgProps} subsvg
 * @property {FilledBoxProps} block
 * @property {FilledBoxProps[]} swatches
 */

/**
 * @param {string[]} colors
 * @returns {SwatchData}
 */
export function createSwatchData(colors) {
  const blockLength = 100;
  const swatchLength = 80;
  const padding = (blockLength - swatchLength) / 2;
  const rowColors = ["#ffff", "#000f"];
  const imgWidth = blockLength * colors.length;
  const rowHeight = blockLength * rowColors.length;
  const dims = {
    swatch: {
      width: swatchLength,
      height: swatchLength,
    },
    img: {
      width: imgWidth,
      height: rowHeight,
    },
    block: {
      width: imgWidth,
      height: blockLength,
    },
  };
  const result = {
    svg: svgProps(dims.img),
    rows: rowColors.map((bg, i) => ({
      subsvg: svgProps({ ...dims.block, x: 0, y: i * blockLength }),
      block: { ...dims.block, fill: bg, x: 0, y: 0 },
      swatches: colors.map((c, i) => ({
        ...dims.swatch,
        fill: c,
        x: i * blockLength + padding,
        y: padding,
      })),
    })),
  };
  // logger("svg context data: ", JSON.stringify(result, null, 2));
  console.assert(colors.length > 1, "colors.length mismatch: " + colors.length, JSON.stringify(colors));
  console.assert(result.rows.length === rowColors.length, "rows legnth mismatch");
  for (let i in result.rows) {
    console.assert(result.rows[i].swatches.length === colors.length, "swatches length mismatch, i=" + i);
  }
  return result;
}

/**
 * @typedef {{ x?: number, y?: number, width: number, height: number }} BoxProps
 */

/** @typedef {BoxProps & { fill: string }} FilledBoxProps */

/**
 * @typedef {BoxProps & {viewBox: string}} SvgProps
 */

/**
 * @param {BoxProps} props
 * @returns SvgProps
 */
function svgProps(props) {
  const { width, height } = props;
  return {
    ...props,
    viewBox: `0 0 ${width} ${height}`,
  };
}
