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
import { formatMs, median, p95, validateBenchRunTimings } from "./bench-measurement.mjs";

const baseURL = process.env.KAMOD_BENCH_URL ?? "http://127.0.0.1:4173";
const sizes = [100, 500, 2000, 10_000];
const kinds = ["line", "stacked-line", "bar", "scatter"];
const repeats = 5;
const warmup = 1;
const updateSeed = 99;

const waitForInitialReady = async (page) => {
  await page.waitForFunction(() => {
    const snap = window.__KAMOD_BENCH__?.getSnapshot?.();
    return snap?.initialReadyAt != null;
  });
};

const runMeasuredUpdate = async (page) => {
  const runId = await page.evaluate((seed) => {
    const bench = window.__KAMOD_BENCH__;
    if (!bench) {
      throw new Error("missing __KAMOD_BENCH__");
    }
    return bench.triggerUpdate(seed);
  }, updateSeed);
  await page.waitForFunction(
    (id) => {
      const snap = window.__KAMOD_BENCH__?.getSnapshot?.();
      const run = snap?.runs?.[id];
      return run?.updateCompleteAt != null;
    },
    runId,
    { timeout: 15_000 },
  );
  return runId;
};

const collectRunMetrics = async (page, runId) => {
  return page.evaluate((id) => {
    const nav = performance.getEntriesByType("navigation")[0];
    const navigationStart = nav?.fetchStart ?? 0;
    const snap = window.__KAMOD_BENCH__?.getSnapshot();
    if (!snap) {
      throw new Error("missing benchmark snapshot");
    }
    const run = snap.runs[id];
    return {
      navigationStart,
      initialReadyAt: snap.initialReadyAt,
      updateStartAt: run?.updateStartAt ?? null,
      updateCompleteAt: run?.updateCompleteAt ?? null,
      meta: snap.meta,
      runId: id,
    };
  }, runId);
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const rawRuns = [];
const summaries = [];
const errors = [];

for (const kind of kinds) {
  for (const size of sizes) {
    const readySamples = [];
    const updateSamples = [];
    let scenarioMeta = null;

    for (let run = 0; run < warmup + repeats; run += 1) {
      await page.goto(`${baseURL}/?page=bench&bench=${kind}&points=${size}`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("[data-kamod-chart-surface]");
      await waitForInitialReady(page);

      const initialMetrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const navigationStart = nav?.fetchStart ?? 0;
        const snap = window.__KAMOD_BENCH__?.getSnapshot();
        if (!snap) {
          throw new Error("missing benchmark snapshot");
        }
        return {
          navigationStart,
          initialReadyAt: snap.initialReadyAt,
          meta: snap.meta,
        };
      });

      scenarioMeta = initialMetrics.meta;
      const readyError = validateBenchRunTimings({
        navigationStart: initialMetrics.navigationStart,
        initialReadyAt: initialMetrics.initialReadyAt,
        updateStartAt: null,
        updateCompleteAt: null,
        expectUpdate: false,
      });
      if (readyError) {
        errors.push({ kind, size, run, phase: "initial-ready", message: readyError });
        continue;
      }

      const readyMs = initialMetrics.initialReadyAt - initialMetrics.navigationStart;

      let updateMs = null;
      try {
        const runId = await runMeasuredUpdate(page);
        const updateMetrics = await collectRunMetrics(page, runId);
        const updateError = validateBenchRunTimings({
          navigationStart: updateMetrics.navigationStart,
          initialReadyAt: updateMetrics.initialReadyAt,
          updateStartAt: updateMetrics.updateStartAt,
          updateCompleteAt: updateMetrics.updateCompleteAt,
          expectUpdate: true,
        });
        if (updateError) {
          errors.push({ kind, size, run, phase: "update", message: updateError, runId });
        } else {
          updateMs = updateMetrics.updateCompleteAt - updateMetrics.updateStartAt;
        }

        rawRuns.push({
          kind,
          size,
          run,
          readyMs,
          updateMs,
          ...updateMetrics,
        });
      } catch (cause) {
        errors.push({
          kind,
          size,
          run,
          phase: "update",
          message: cause instanceof Error ? cause.message : String(cause),
        });
      }

      if (run >= warmup) {
        if (Number.isFinite(readyMs)) {
          readySamples.push(readyMs);
        }
        if (updateMs != null && Number.isFinite(updateMs)) {
          updateSamples.push(updateMs);
        }
      }
    }

    const readyMedian = median(readySamples);
    const readyP95 = p95(readySamples);
    const updateMedian = median(updateSamples);
    const updateP95 = p95(updateSamples);

    summaries.push({
      kind,
      size,
      rawPoints: scenarioMeta?.rawPoints ?? size,
      visiblePoints: scenarioMeta?.visiblePoints ?? null,
      seriesCount: scenarioMeta?.seriesCount ?? null,
      readyMedianMs: readyMedian,
      readyP95Ms: readyP95,
      updateMedianMs: updateMedian,
      updateP95Ms: updateP95,
      sampleCount: readySamples.length,
      updateSampleCount: updateSamples.length,
      p95Note: readySamples.length < 20 ? "coarse estimate (few samples)" : null,
    });
  }
}

await browser.close();

const outDir = resolve(import.meta.dirname, "../docs/performance");
await mkdir(outDir, { recursive: true });
const jsonFile = resolve(outDir, "browser-benchmarks.raw.json");
const outFile = resolve(outDir, "browser-benchmarks.md");

await writeFile(
  jsonFile,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), rawRuns, summaries, errors }, null, 2)}\n`,
);

const aggregates = summaries;
const p95Footnote = aggregates.some((row) => row.p95Note);
const env = `Chromium ${process.env.PLAYWRIGHT_CHROMIUM_VERSION ?? "bundled"}, viewport 1280×720, reduced motion, ${repeats} samples (+${warmup} warmup).`;
const markdown = [
  "# Browser benchmarks (informative)",
  "",
  "Method:",
  "",
  "- **Navigation → initial-ready:** `performance.timeOrigin` navigation `fetchStart` until fixture records initial-ready after **two** `requestAnimationFrame` callbacks (DOM commit observation point, not GPU/paint timing).",
  "- **Update:** runner calls `triggerUpdate(seed)` only after initial-ready; **update duration** is `updateCompleteAt - updateStartAt` where complete uses the same double-rAF boundary after `setData`.",
  "- Missing or invalid timings are omitted from aggregates (not reported as `0`). Raw rows: [browser-benchmarks.raw.json](./browser-benchmarks.raw.json).",
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
  "| Chart | Raw points | Visible points | Ready median ms | Ready p95 ms | Update median ms | Update p95 ms |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...aggregates.map(
    (row) =>
      `| ${row.kind} | ${row.rawPoints} | ${row.visiblePoints ?? "—"} | ${formatMs(row.readyMedianMs)} | ${formatMs(row.readyP95Ms)}${row.p95Note ? " *" : ""} | ${formatMs(row.updateMedianMs)} | ${formatMs(row.updateP95Ms)}${row.p95Note ? " *" : ""} |`,
  ),
  "",
  p95Footnote ? "* p95 with few samples is a coarse estimate." : "",
  errors.length > 0
    ? `\n## Measurement errors (${errors.length})\n\n\`\`\`json\n${JSON.stringify(errors, null, 2)}\n\`\`\`\n`
    : "",
].join("\n");

await writeFile(outFile, markdown);
console.log(markdown);
if (errors.length > 0) {
  console.error(`benchmark completed with ${errors.length} measurement error(s); see ${jsonFile}`);
  process.exitCode = 1;
}
