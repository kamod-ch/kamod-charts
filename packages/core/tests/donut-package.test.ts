import { h } from "preact";
import { readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = join(packageRoot, "dist");
const donutEntry = join(distRoot, "charts/donut-chart.js");

const cartesianChartEntries = new Set([
  "charts/area-chart.js",
  "charts/bar-chart.js",
  "charts/line-chart.js",
  "charts/scatter-chart.js",
]);

const collectDistGraph = async (
  entryPath: string,
  visited = new Set<string>(),
): Promise<Set<string>> => {
  const normalized = relative(distRoot, entryPath);
  if (visited.has(normalized)) {
    return visited;
  }

  visited.add(normalized);
  const source = await readFile(entryPath, "utf8");
  const importPattern = /(?:from|import)\s+["'](\.\.?\/[^"']+)["']/g;

  for (const match of source.matchAll(importPattern)) {
    const importedPath = join(dirname(entryPath), match[1]!);
    await collectDistGraph(importedPath, visited);
  }

  return visited;
};

describe("@kamod-ch/charts/donut package boundary", () => {
  it("does not pull cartesian chart entry modules into the focused donut graph", async () => {
    const graph = await collectDistGraph(donutEntry);
    const offenders = [...graph].filter((file) => cartesianChartEntries.has(file));

    expect(offenders).toEqual([]);
    expect(graph.has("charts/donut-chart.js")).toBe(true);
  });

  it("imports without browser globals during SSR module evaluation", async () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    // @ts-expect-error simulate SSR environment
    delete globalThis.window;
    // @ts-expect-error simulate SSR environment
    delete globalThis.document;

    let mod: {
      DonutChart: (props: {
        data: readonly { name: string; value: number }[];
        valueKey: string;
        labelKey: string;
        width: number;
        height: number;
      }) => ReturnType<typeof h>;
    };
    try {
      mod = await import(pathToFileURL(donutEntry).href);
      expect(mod.DonutChart).toBeTypeOf("function");
      expect(mod).not.toHaveProperty("useCircularChartController");
      expect(mod).not.toHaveProperty("CircularChartView");
    } finally {
      globalThis.window = previousWindow;
      globalThis.document = previousDocument;
    }

    const markup = renderToString(
      h(mod.DonutChart, {
        data: [
          { name: "A", value: 40 },
          { name: "B", value: 60 },
        ],
        valueKey: "value",
        labelKey: "name",
        width: 320,
        height: 320,
      }),
    );

    expect(markup).toContain("data-kamod-chart-donut");
    expect(markup).not.toMatch(/NaN/);
  });

  it("exports donut types from the focused declaration entry", async () => {
    const declaration = await readFile(join(distRoot, "charts/donut-chart.d.ts"), "utf8");

    for (const symbol of [
      "DonutChart",
      "DonutChartProps",
      "DonutVariant",
      "DonutCenterContext",
      "DonutCenterContent",
      "DonutFormatTotal",
    ]) {
      expect(declaration).toContain(symbol);
    }

    expect(declaration).not.toMatch(/useCircularChartController/);
    expect(declaration).not.toMatch(/CircularChartView/);
  });
});
