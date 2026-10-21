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
          "@kamod-ch/charts/bar": resolve(import.meta.dirname, "../core/src/charts/bar-chart.tsx"),
          "@kamod-ch/charts/donut": resolve(
            import.meta.dirname,
            "../core/src/charts/donut-chart.tsx",
          ),
          "@kamod-ch/charts/line": resolve(
            import.meta.dirname,
            "../core/src/charts/line-chart.tsx",
          ),
          "@kamod-ch/charts/motion": resolve(import.meta.dirname, "../core/src/motion/index.ts"),
          "@kamod-ch/charts": resolve(import.meta.dirname, "../core/src/index.ts"),
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
        line: resolve(import.meta.dirname, "src/line.ts"),
        bar: resolve(import.meta.dirname, "src/bar.ts"),
        donut: resolve(import.meta.dirname, "src/donut.ts"),
        dashboard: resolve(import.meta.dirname, "src/dashboard.ts"),
        "motion-line": resolve(import.meta.dirname, "src/motion-line.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
