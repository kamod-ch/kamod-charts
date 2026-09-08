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

const donutRootTypeExports = ["DonutChartProps", "DonutVariant", "DonutCenterContext"];

const donutSubpathTypeExports = [
  "DonutChartProps",
  "DonutVariant",
  "DonutCenterContext",
  "DonutCenterContent",
  "DonutFormatTotal",
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

const internalControllerSymbols = ["useCircularChartController", "CircularChartView"];

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

const rootModule = await import(resolve(root, "packages/core/dist/index.js"));
if (typeof rootModule.DonutChart !== "function") {
  throw new Error("Root export missing runtime symbol: DonutChart");
}
if (typeof rootModule.PieChart !== "function") {
  throw new Error("Root export missing runtime symbol: PieChart");
}

const donutModule = await import(resolve(root, "packages/core/dist/charts/donut-chart.js"));
if (typeof donutModule.DonutChart !== "function") {
  throw new Error("Donut subpath missing runtime symbol: DonutChart");
}

const pieModule = await import(resolve(root, "packages/core/dist/charts/pie-chart.js"));
if (typeof pieModule.PieChart !== "function") {
  throw new Error("Pie subpath missing runtime symbol: PieChart");
}

for (const symbol of internalControllerSymbols) {
  if (symbol in rootModule) {
    throw new Error(`Root export must not expose internal symbol: ${symbol}`);
  }
  if (symbol in donutModule) {
    throw new Error(`Donut subpath must not expose internal symbol: ${symbol}`);
  }
  if (symbol in pieModule) {
    throw new Error(`Pie subpath must not expose internal symbol: ${symbol}`);
  }
}

const rootTypes = await readFile(resolve(root, "packages/core/dist/index.d.ts"), "utf8");
for (const symbol of pieTypeExports) {
  if (!rootTypes.includes(symbol)) {
    throw new Error(`Root types missing export: ${symbol}`);
  }
}
for (const symbol of donutRootTypeExports) {
  if (!rootTypes.includes(symbol)) {
    throw new Error(`Root types missing export: ${symbol}`);
  }
}
for (const symbol of internalControllerSymbols) {
  if (rootTypes.includes(`${symbol}`)) {
    throw new Error(`Root types must not export internal symbol: ${symbol}`);
  }
}

const donutTypes = await readFile(
  resolve(root, "packages/core/dist/charts/donut-chart.d.ts"),
  "utf8",
);
for (const symbol of donutSubpathTypeExports) {
  if (!donutTypes.includes(symbol)) {
    throw new Error(`Donut subpath types missing export: ${symbol}`);
  }
}
for (const symbol of internalControllerSymbols) {
  if (donutTypes.includes(symbol)) {
    throw new Error(`Donut subpath types must not export internal symbol: ${symbol}`);
  }
}

const pieTypes = await readFile(resolve(root, "packages/core/dist/charts/pie-chart.d.ts"), "utf8");
if (!pieTypes.includes("PieChart")) {
  throw new Error("Pie subpath types missing export: PieChart");
}
if (pieTypes.includes("DonutChart")) {
  throw new Error("Pie subpath must remain donut-free for backward compatibility");
}

const seriesTypes = await readFile(resolve(root, "packages/core/dist/series/index.d.ts"), "utf8");
for (const symbol of seriesPieTypeExports) {
  if (!seriesTypes.includes(symbol)) {
    throw new Error(`Series types missing export: ${symbol}`);
  }
}

console.log("package exports ok");
