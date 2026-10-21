# Canvas line/area decision (Prompt 11)

**Date:** 2026-10-20  
**Environment:** Linux, Chromium (Playwright bundled), viewport 1280×720, `prefers-reduced-motion: reduce` for benchmarks.  
**Fixture:** `@kamod-ch/charts-browser-fixture` preview on `http://127.0.0.1:4173` (`scripts/browser-benchmark.mjs`).

## Recommendation: **DEFER** optional Canvas renderer

Stay on SVG for cartesian monitoring and general line/area charts. Measured update cost stays acceptable for typical monitoring layouts (≤4 full-size line charts at ≤2k visible points per series) after existing downsampling, viewport clipping, and streaming caps. Canvas would duplicate the cartesian pipeline (scales, viewport, brush sync, reference layers, a11y, export) without removing the dominant costs we measured at extreme point counts.

If product needs **>10k visible scatter points** or **many simultaneous animated series**, revisit with a narrow RFC (see below)—not a default migration.

## Gates (2026-10-20)

| Command                              | Result                                                            |
| ------------------------------------ | ----------------------------------------------------------------- |
| `pnpm check`                         | pass (566 unit tests + bench measurement tests + package exports) |
| `pnpm test:browser`                  | pass (13 Playwright tests, incl. `e2e/monitoring-demo.spec.ts`)   |
| `pnpm smoke:consumer`                | pass                                                              |
| `pnpm docs:build`                    | pass                                                              |
| `node scripts/browser-benchmark.mjs` | pass (see matrix below)                                           |

## Measured bottlenecks (browser benchmark)

Protocol: navigation → **initial-ready** and data **update** durations use double `requestAnimationFrame` boundaries ([`bench-measurement.mjs`](../../scripts/bench-measurement.mjs)). Raw JSON: [`docs/performance/browser-benchmarks.raw.json`](../performance/browser-benchmarks.raw.json).

| Chart kind   | Raw points | Visible / drawn | Series | Update median (ms) | Update p95 (ms) | Dominant phase                    |
| ------------ | ---------: | --------------: | -----: | -----------------: | --------------: | --------------------------------- |
| line         |      2 000 |           2 000 |      1 |               27.0 |            33.5 | SVG path + layout (moderate)      |
| line         |     10 000 |          10 000 |      1 |               37.6 |            47.0 | SVG DOM still sub-50 ms median    |
| stacked-line |     10 000 |          10 000 |      2 |               35.8 |            42.0 | Same class as line                |
| bar          |     10 000 |  25 (decimated) |      1 |               27.4 |            32.2 | Bar decimation effective          |
| scatter      |      2 000 |           2 000 |      2 |               98.6 |           126.6 | Many mark elements / hit targets  |
| scatter      |     10 000 |          10 000 |      2 |         **1341.2** |      **1503.3** | SVG mark count (outlier use case) |

**Monitoring-shaped workload (qualitative, `?page=monitoring`):**

| Layout                            |         Raw buffer (typical live) |              Drawn points (per chart) | Notes                                                         |
| --------------------------------- | --------------------------------: | ------------------------------------: | ------------------------------------------------------------- |
| 3× `LineChart` + 3× `Sparkline`   | ~320–800 rows (seed sim, 4 k cap) | Downsampled to plot width (~hundreds) | Live 4 Hz ingest, 24 fps visual cap via `useTimeSeriesBuffer` |
| Synced crosshair + shared xDomain |                              same |                                  same | Extra React/Preact updates, not separate layout engine        |
| Modifier-wheel zoom               |                              same |                fewer rows in viewport | Y autoscale on visible slice                                  |

Sparklines use the same `LineChart` primitive (no second layout engine); their cost is dominated by one small path per KPI, not by KPI layout.

**Not measured as universal leak proof:** `performance.memory` / heap during long runs is environment-dependent; streaming fixture and buffer tests assert timer cleanup and bounded capacity instead.

## Why not GO now

1. **Line monitoring path:** 10k **line** points remain ~38 ms median update—within interactive budget on desktop; min/max downsampling plus viewport already limit drawn geometry for real dashboards.
2. **Cost of Canvas:** Would need parallel implementations for export (SVG remains required), accessibility (text/title/desc, keyboard focus), reference layers, and synchronized multi-chart DOM—high integration cost for uncertain gain on the primary Syncding-style scenario.
3. **Clear SVG pain is narrow:** Scatter at 10k×2 series is the outlier; monitoring demo uses lines with null gaps, not dense scatter.

## Remaining SVG optimizations (before Canvas)

- Extend automatic decimation defaults for wide viewports when `connectNulls` is false and raw points ≫ pixel width (already partially covered by `downsampleMinMaxSegmented`).
- Scatter-specific mark pooling or level-of-detail when `visiblePoints > 2000`.
- Optional `will-change` / layer promotion only after profiling shows paint-bound frames (not observed in line benchmarks).

## If revisiting GO later (RFC scope only)

Optional `@kamod-ch/charts/canvas` module would:

- Share **one** data pipeline: `TimeSeriesBuffer` view → downsample → scales from `@kamod-ch/charts/core`.
- Share viewport/brush hooks (`xDomain`, `useSynchronizedCartesianXDomain`) without forking brush semantics.
- Render lines/areas to `<canvas>` inside existing chart chrome; keep SVG for axes, grid, references, and export source.
- Document a11y trade-offs (canvas subpath not in accessibility tree; require visible table/alternate summary).

**No implementation** in this milestone—RFC only if product mandates >10k **visible** line points without downsampling or multi-chart scatter dashboards.

## Manual accessibility check (not replaced by automation)

Performed 2026-10-20 on docs monitoring demo (`/examples/monitoring`) with keyboard only:

- Tab reaches Live/Pause, window, reset, export, and performance controls.
- Chart surfaces expose `title` / `description` (see `e2e/aria-and-layout.spec.ts` pattern on fixtures).
- Sparkline KPIs: `Sparkline` sets `title` + `description` (trend summary) on the embedded `LineChart`.

Automated tests cover ARIA presence on fixtures; they do **not** certify screen reader UX in every browser/OS combination.
