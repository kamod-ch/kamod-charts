import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "accessibility/index": "src/accessibility/index.ts",
    "animation/index": "src/animation/index.ts",
    "axes/index": "src/axes/index.ts",
    "charts/area-chart": "src/charts/area-chart.tsx",
    "charts/bar-chart": "src/charts/bar-chart.tsx",
    "charts/line-chart": "src/charts/line-chart.tsx",
    "charts/pie-chart": "src/charts/pie-chart.tsx",
    "charts/scatter-chart": "src/charts/scatter-chart.tsx",
    "core/index": "src/core/index.ts",
    "interaction/index": "src/interaction/index.ts",
    "performance/index": "src/performance/index.ts",
    "primitives/index": "src/primitives/index.ts",
    "scales/index": "src/scales/index.ts",
    "series/index": "src/series/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: "esnext",
  external: ["preact", "preact/hooks", "preact/jsx-runtime"],
});
