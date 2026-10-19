#!/usr/bin/env node
/**
 * Informative browser benchmarks (median / p95). Requires preview server on 127.0.0.1:4173.
 *
 *   pnpm --filter @kamod-ch/charts-browser-fixture build
 *   pnpm --filter @kamod-ch/charts-browser-fixture preview &
 *   node scripts/browser-benchmark.mjs
 */
import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const baseURL = process.env.KAMOD_BENCH_URL ?? "http://127.0.0.1:4173";
const sizes = [100, 500, 2000, 10_000];
const kinds = ["line", "stacked-line", "bar", "scatter"];
const repeats = 5;
const warmup = 1;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const p95 = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0;
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const results = [];

for (const kind of kinds) {
  for (const size of sizes) {
    const readySamples = [];
    const updateSamples = [];
    for (let run = 0; run < warmup + repeats; run += 1) {
      await page.goto(`${baseURL}/?page=bench&bench=${kind}&points=${size}`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("[data-kamod-chart-surface]");
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const start = nav?.fetchStart ?? 0;
        const marks = window.__KAMOD_BENCH__?.getMarks() ?? { ready: [], updated: [] };
        const readyAt = marks.ready.at(-1) ?? performance.now();
        const updatedAt = marks.updated.at(-1);
        return {
          readyMs: readyAt - start,
          updateMs: updatedAt != null ? updatedAt - readyAt : 0,
        };
      });
      if (run >= warmup) {
        readySamples.push(metrics.readyMs);
        updateSamples.push(metrics.updateMs);
      }
    }
    results.push({
      kind,
      size,
      readyMedianMs: median(readySamples),
      readyP95Ms: p95(readySamples),
      updateMedianMs: median(updateSamples),
      updateP95Ms: p95(updateSamples),
    });
  }
}

await browser.close();

const outDir = resolve(import.meta.dirname, "../docs/performance");
await mkdir(outDir, { recursive: true });
const outFile = resolve(outDir, "browser-benchmarks.md");
const env = `Chromium ${process.env.PLAYWRIGHT_CHROMIUM_VERSION ?? "bundled"}, viewport 1280×720, reduced motion, ${repeats} samples (+${warmup} warmup).`;
const markdown = [
  "# Browser benchmarks (informative)",
  "",
  "Method: navigation start → `performance.now()` when the fixture calls `markReady()` after first paint hook;",
  "data update measures `markUpdated()` after a zero-delay state refresh. **Not** layout/paint timing.",
  "",
  env,
  "",
  "Reproduce:",
  "",
  "```sh",
  "pnpm --filter @kamod-ch/charts-browser-fixture build",
  "pnpm --filter @kamod-ch/charts-browser-fixture preview",
  "node scripts/browser-benchmark.mjs",
  "```",
  "",
  "| Chart | Points | Ready median ms | Ready p95 ms | Update median ms | Update p95 ms |",
  "| --- | ---: | ---: | ---: | ---: | ---: |",
  ...results.map(
    (row) =>
      `| ${row.kind} | ${row.size} | ${row.readyMedianMs.toFixed(1)} | ${row.readyP95Ms.toFixed(1)} | ${row.updateMedianMs.toFixed(1)} | ${row.updateP95Ms.toFixed(1)} |`,
  ),
  "",
  "Target to validate (not a guarantee): p95 ready &lt; 16 ms at 2 000 points on a dev machine.",
  "",
].join("\n");

await writeFile(outFile, markdown);
console.log(markdown);
