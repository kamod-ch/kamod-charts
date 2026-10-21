import preact from "@preact/preset-vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@kamod-ch/charts/export/png": resolve(__dirname, "../core/src/export/png-entry.ts"),
      "@kamod-ch/charts/export": resolve(__dirname, "../core/src/export/index.ts"),
      "@kamod-ch/charts/bar-chart": resolve(__dirname, "../core/src/charts/bar-chart.tsx"),
      "@kamod-ch/charts/line-chart": resolve(__dirname, "../core/src/charts/line-chart.tsx"),
      "@kamod-ch/charts/scatter-chart": resolve(__dirname, "../core/src/charts/scatter-chart.tsx"),
      "@kamod-ch/charts": resolve(__dirname, "../core/src/index.ts"),
    },
  },
  server: {
    port: 5199,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
