# SVG monitoring progress (Prompts 00–13)

Plan: [kamod-charts-svg-analyse-cursor-prompts.md](./kamod-charts-svg-analyse-cursor-prompts.md) · Baseline: [svg-monitoring-baseline.md](./svg-monitoring-baseline.md)

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Commit (Start) | `001ad79c65c5ece59cb9fae287331a9eaae8b050` |
| Package        | `@kamod-ch/charts` 0.2.0                   |

## Prompt status

| Prompt | Status   | Notes                                                                            |
| -----: | -------- | -------------------------------------------------------------------------------- |
|     00 | **done** | Baseline + `pnpm check` pass (2026-10-20)                                        |
|     01 | **done** | Protokoll, Regressionstest, echte Bench-Messung                                  |
|     02 | **done** | `downsampleMinMaxSegmented` + Tests/Docs                                         |
|     03 | **done** | Export nearest-wins + all-computed per element                                   |
|     04 | **done** | Tick hide: Y extent, descending, edge overlap                                    |
|     05 | **done** | `xDomain`, helpers, line/area wiring, docs demo                                  |
|     06 | **done** | X pan/zoom hook, line/area, fixture, e2e, docs                                   |
|     07 | **done** | Brush, `LineChartWithXBrush`, synced xDomain hook                                |
|     08 | **done** | Shared reference layers; Area parity; docs/tests                                 |
|     09 | **done** | TimeSeriesBuffer, useTimeSeriesBuffer, fixture/docs                              |
|     10 | **done** | Sparkline preset, monitoring demo, fixture, e2e, gallery                         |
|     11 | **done** | Gates + [canvas-decision.md](./canvas-decision.md) (DEFER)                       |
|     12 | **done** | PNG (`@kamod-ch/charts/export/png`), CSV helper, docs, monitoring export buttons |
|     13 | **done** | `computeHistogramBins`, BarChart recipe `/recipes/histogram`                     |

## Prompt 10 deliverables

| Artifact           | Path                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `Sparkline` preset | `packages/core/src/charts/sparkline.tsx`, export via `@kamod-ch/charts`                                 |
| Seeded simulation  | `packages/docs/lib/monitoring-simulation.ts`                                                            |
| Docs demo          | `packages/docs/components/examples/SyncdingMonitoringDemo.tsx`, `packages/docs/examples/monitoring.mdx` |
| Browser fixture    | `packages/browser-fixture/src/MonitoringFixture.tsx`, `?page=monitoring`                                |
| E2E                | `e2e/monitoring-demo.spec.ts`                                                                           |
| Gallery            | `packages/docs/data/gallery.ts` (`monitoring-demo`)                                                     |

## Checks

| Date       | Command                              | Result                                            |
| ---------- | ------------------------------------ | ------------------------------------------------- |
| 2026-10-20 | `pnpm check`                         | pass (566 unit tests + bench measurement tests)   |
| 2026-10-20 | `pnpm test:browser`                  | pass (13 Playwright tests)                        |
| 2026-10-20 | `pnpm smoke:consumer`                | pass                                              |
| 2026-10-20 | `pnpm docs:build`                    | pass                                              |
| 2026-10-20 | `node scripts/browser-benchmark.mjs` | pass (Chromium, preview :4173)                    |
| 2026-10-21 | `pnpm check`                         | pass (579 unit tests)                             |
| 2026-10-21 | `pnpm test:browser`                  | pass (13 Playwright tests; fresh fixture preview) |
| 2026-10-21 | `pnpm docs:build`                    | pass                                              |

## Prompt 12–13 deliverables

| Artifact          | Path                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| PNG raster export | `@kamod-ch/charts/export/png` — `renderChartToPngBlob`, `downloadChartPng`               |
| CSV data export   | `@kamod-ch/charts/export` — `serializeChartDataCsv`, `downloadChartDataCsv`              |
| Docs              | [chart-data-csv.md](./chart-data-csv.md), [svg-export.md](./svg-export.md) (PNG section) |
| Histogram helper  | `packages/core/src/data/histogram-bins.ts`                                               |
| Recipe            | `packages/docs/recipes/histogram.mdx`, `HistogramLatencyExample.tsx`                     |

## Decisions

- **2026-10-20:** Monitoring-Prompts sind unabhängig von `svg-roadmap-progress.md` (anderes Nummerierungsschema). Checkout entspricht Analyse-Commit; keine Git-Reset-Aktion.
- **2026-10-20:** Canvas line/area **DEFER** — siehe [canvas-decision.md](./canvas-decision.md); scatter 10k×2 ist der gemessene SVG-Ausreißer, Monitoring-Lines bleiben im Budget.
- **2026-10-20:** Vite-Alias `@kamod-ch/charts/export` in docs + browser-fixture (vor generischem `@kamod-ch/charts`), damit Monitoring-Export im Docs-Build auflöst.

## Risks / follow-ups

- `MonitoringFixture` dupliziert die Demo-Komponente gegenüber `SyncdingMonitoringDemo` (bewusst, da Fixture kein Docs-Package importiert).
- Lange Live-Läufe: Heap nur qualitativ; Kapazitätsgrenzen durch `TimeSeriesBuffer`-Tests abgedeckt.
