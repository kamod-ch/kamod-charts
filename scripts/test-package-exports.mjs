import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(await readFile(resolve(root, "packages/core/package.json"), "utf8"));

const pieTypeExports = [
  "PieChartProps",
  "PieSliceContext",
  "PieTooltipOptions",
  "PieLegendOptions",
  "PieLabelOptions",
  "PieLabelLineOptions",
  "PieLabelCollision",
  "PieLabels",
  "PieRose",
  "PieRoseOptions",
];

const seriesPieTypeExports = [
  "PieDatum",
  "PieSeriesProps",
  "PieSortComparator",
  "PieSliceContext",
  "PieLabelOptions",
  "PieRoseOptions",
  "normalizePieData",
  "layoutPieLabels",
];

for (const [name, entry] of Object.entries(packageJson.exports)) {
  if (name === "./theme.css") {
    continue;
  }

  const importPath = typeof entry === "string" ? entry : entry.import;
  const typesPath = typeof entry === "string" ? undefined : entry.types;

  if (!importPath) {
    throw new Error(`Export ${name} has no import path`);
  }

  await import(resolve(root, "packages/core", importPath));

  if (typesPath) {
    await access(resolve(root, "packages/core", typesPath));
  }
}

const rootTypes = await readFile(resolve(root, "packages/core/dist/index.d.ts"), "utf8");
for (const symbol of pieTypeExports) {
  if (!rootTypes.includes(symbol)) {
    throw new Error(`Root types missing export: ${symbol}`);
  }
}

const seriesTypes = await readFile(resolve(root, "packages/core/dist/series/index.d.ts"), "utf8");
for (const symbol of seriesPieTypeExports) {
  if (!seriesTypes.includes(symbol)) {
    throw new Error(`Series types missing export: ${symbol}`);
  }
}

console.log("package exports ok");
