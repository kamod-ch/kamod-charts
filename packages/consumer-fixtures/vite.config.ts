import { resolve } from "node:path";
import { defineConfig } from "vite";

const useDist = process.env.KAMOD_CONSUMER_USE_DIST === "1";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "preact",
  },
  resolve: {
    alias: useDist
      ? undefined
      : {
          "@kamod-ch/charts/bar": resolve(__dirname, "../core/src/charts/bar-chart.tsx"),
          "@kamod-ch/charts/donut": resolve(__dirname, "../core/src/charts/donut-chart.tsx"),
          "@kamod-ch/charts/line": resolve(__dirname, "../core/src/charts/line-chart.tsx"),
          "@kamod-ch/charts/motion": resolve(__dirname, "../core/src/motion/index.ts"),
          "@kamod-ch/charts": resolve(__dirname, "../core/src/index.ts"),
        },
  },
  optimizeDeps: useDist ? { include: ["@kamod-ch/charts"] } : undefined,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      treeshake: false,
      input: {
        line: resolve(__dirname, "src/line.ts"),
        bar: resolve(__dirname, "src/bar.ts"),
        donut: resolve(__dirname, "src/donut.ts"),
        dashboard: resolve(__dirname, "src/dashboard.ts"),
        "motion-line": resolve(__dirname, "src/motion-line.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
