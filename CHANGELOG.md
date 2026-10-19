# Changelog

All notable changes to `@kamod-ch/charts` are documented here.

## Unreleased

### Added

- Cartesian charts: optional `yDomain`, `margin`, `class`, `style`, `emptyContent`, and `format` (see RFC 0009).
- `LineChart` / `AreaChart`: controlled `activeIndex` and `onActiveChange`; `BarChart` controlled selection callbacks.
- `useSynchronizedCartesianSelection`, `findNearestDatumIndexByX`, and `downsampleMinMax` export from `@kamod-ch/charts/performance`.
- `ChartFormatProvider` and locale-aware default tooltip formatters.
- Playwright coverage for sync charts, a11y, and bar clicks; browser benchmark and consumer bundle reporting scripts.

### Fixed

- `ChartSurface` uses `aria-describedby` for descriptions (title remains on `aria-labelledby`).
- Plot capture layer ordering so bar clicks work with `tooltip={true}`.

## 0.2.0 — 2026-09-09

### Added

- **Line charts:** typed `LineSeriesConfig` with per-series `strokeWidth`, `strokeDasharray`, `showPoints`, and `pointRadius` (chart-level defaults remain; series overrides win).
- **Line charts:** optional `stacked` mode with cumulative geometry, legend toggles, motion support, and tooltips that still report each series' raw value (`stackStart` / `stackEnd` on tooltip context when stacked).
- **Line charts:** `referenceAreas` and `referencePoints` props on `LineChart` for vertical/horizontal highlight bands and explicit event markers (`circle`, `square`, `diamond`).
- **Line charts:** extended `referenceLines` with optional `strokeWidth` and `strokeDasharray` (legacy default dash pattern preserved when omitted).
- **Primitives:** `ReferenceArea`, `ReferencePoint`, and geometry helpers exported from `@kamod-ch/charts/primitives`.
- **Series:** `StackedLineSeries`, `MotionStackedLineSeries`, and stacked line point helpers exported from `@kamod-ch/charts/series` and `@kamod-ch/charts/motion`.
- **Theme:** `--chart-reference-area` and `--chart-reference-point` tokens for light/dark annotation contrast.
- Documentation: thirteen LineChart gallery scenarios, API notes, and expanded props table on `/charts/line`.
- **Area charts:** typed `fill` prop with solid or gradient fills (`AreaFill`, `AreaGradientFill`, `AreaGradientDirection` exported from the root and `./series` entry points).
- **Area charts:** step curves (`step`, `stepBefore`, `stepAfter`) via shared `LineCurve` resolution with line charts.
- **Area charts:** optional point markers (`showPoints`, `pointRadius`, `activeIndex`), dashed outlines (`strokeDasharray` with `outline`), and configurable stroke width.
- **Area charts:** gradient `<defs>` with stable, SSR-safe IDs per chart and series.
- Documentation: eight area chart examples, gallery/playground controls, and API notes on curves, fills, markers, and stacked tooltip semantics.
- **Bar charts:** optional `maxBarSize` to cap bar thickness while keeping bars centered in each category band (shared by render, hit-test, tooltip, keyboard, clicks, and motion).
- **Bar charts:** typed `BarSeriesConfig` extending the cartesian series config with per-bar `fill` (`BarFill`, `BarDatumContext`) and optional per-series `valueLabels` overrides.
- **Bar charts:** formatable, positionable value labels via `BarValueLabelOptions` (`auto`, `inside`, `outside`, `center`) on chart or series; `valueLabels={true}` keeps prior auto/outside behaviour for simple positive vertical bars.
- **Bar charts:** `referenceAreas` prop reusing the shared `ReferenceArea` primitive with semantic category/value coordinates that map correctly when `orientation="horizontal"`.
- Documentation: eight BarChart gallery scenarios, API notes, and expanded props tables on `/charts/bar`.
- **Pie charts:** typed `tooltip` prop with value and percentage formatters (`PieTooltipOptions`, `PieSliceContext`).
- **Pie charts:** optional `showLegend` with per-slice visibility toggles keyed by stable slice keys (`PieLegendOptions`).
- **Pie charts:** outside labels with leader lines and collision handling (`PieLabelOptions`, `PieLabelLineOptions`, `labels="outside"` shorthand).
- **Pie charts:** rose / Nightingale layout via `rose` with sqrt-scaled radii by default (`PieRoseOptions`).
- **Pie charts:** configurable `emptyContent` when no positive slices remain (including all legend-hidden).
- **Pie charts:** `activeOffset` for pointer and keyboard highlight expansion.
- **Series:** pie geometry helpers exported from `@kamod-ch/charts/series` (`normalizePieData`, `layoutPieLabels`, `resolvePieRoseOptions`, and related types).
- Documentation: six PieChart gallery scenarios, API notes, and expanded props tables on `/charts/pie`.
- **Scatter charts:** optional bubble sizing through `sizeKey`, configurable radius domains/ranges, and `sqrt` or `linear` size scales.
- **Scatter charts:** category-based colors and legend filtering via `categoryKey` and typed category configuration.
- **Scatter charts:** richer tooltip context, keyboard and pointer interaction, animated updates, and `referenceAreas`, `referencePoints`, and `referenceSegments` annotations.
- **Primitives:** `ReferenceSegment` and its geometry helpers exported from `@kamod-ch/charts/primitives`.
- Documentation: expanded ScatterChart gallery, API notes, datasets, and props tables on `/charts/scatter`.
- **Donut charts:** dedicated `DonutChart` component with responsive `innerRadiusRatio` sizing and `full` or `half` variants.
- **Donut charts:** automatic visible-slice totals, custom center content, rounded and padded segments, and the PieChart tooltip, legend, label, empty-state, and interaction features.
- **Package exports:** tree-shakeable `@kamod-ch/charts/donut` subpath, with `DonutChart`, `DonutChartProps`, and `DonutCenterContext` also exported from the package root.
- Documentation: DonutChart guide, four gallery examples, API notes, datasets, and props tables on `/charts/donut`.

### Changed

- **Pie charts:** keyboard navigation skips zero, negative, and non-finite values; initial keyboard focus starts unselected (`null`) instead of index `0`; Escape clears the active slice instead of resetting to the first row.
- **Pie charts:** percentages and totals recompute from visible slices when legend items are toggled off.

### Fixed

- **Reference lines:** decorative reference lines now set `aria-hidden="true"` consistently with reference areas and points.
- **Area charts:** stacked areas now honor `curve` and `outline` (previously ignored on `StackedAreaSeries`).
- **Area charts:** `basis` curve no longer falls back to `linear` for area paths.
- **Pie charts:** tooltip anchor geometry now respects outside-label gutter shrink via shared `resolvePieOuterRadius`.

### Notes

- **Backward compatible / additive:** existing `PieChart` usage requires no migration. New props (`tooltip`, `showLegend`, `rose`, `labels` object form, `emptyContent`, `activeOffset`, `legend`) are optional; defaults preserve prior rendering (`tooltip` and `showLegend` default to off, `labels` defaults to `"inside"`, `innerRadius` defaults to `0`).
- **Backward compatible:** `innerRadius`, `outerRadius`, `padAngle`, `cornerRadius`, `sort={false}`, label string shorthands (`"inside" | "outside" | "none"`), `colors`, `centerContent`, `onSegmentClick`, and `animate` behave as before when unset.
- Keyboard-only consumers should note the initial unselected state and visible-slice navigation — opt in to `tooltip` or `onSegmentClick` for explicit activation feedback.
- `@kamod-ch/charts/pie` and `@kamod-ch/charts/motion` follow existing subpath conventions; no new package exports were added.
- No new runtime dependencies.
- **Backward compatible / additive:** existing `LineChart` usage requires no migration. New props (`stacked`, `referenceAreas`, `referencePoints`, per-series styles) are optional; defaults preserve prior behaviour (`stacked` defaults to `false`, curve defaults to `linear`).
- **Backward compatible / additive:** existing `BarChart` usage requires no migration. New props (`maxBarSize`, `referenceAreas`, typed `fill`, `BarValueLabelOptions`) are optional; `valueLabels={true}`, `radius`, `minBarSize`, `stacked`, `grouped`, `orientation`, and `onBarClick` behave as before. `BarSeriesConfig` is a superset of `CartesianSeriesConfig` — existing `series` entries remain valid.
- Shared stack helpers (`getStackedValues`, `inferStackedDomain`) are reused by Area and Line charts; AreaChart behaviour is unchanged.
- Default area curve remains `linear`; `showPoints` defaults to `false` for backward compatibility.
- `@kamod-ch/charts/line` and `@kamod-ch/charts/area` stay motion-free; animation props delegate to optional motion slots when a provider is present.

## 0.1.0 — 2026-09-07

First public release.

### Added

- High-level charts: Line, Area, Bar, Pie, Scatter with responsive sizing and SSR-safe rendering.
- Configurable tooltips with collision-safe placement, formatters, and axis/nearest modes.
- Legend toggling with domain and interaction recomputation on Area/Bar/Line/Scatter.
- Composable primitives: `Chart`, axes, grid, series, reference lines, tooltip, crosshair, live region.
- Accessibility helpers: keyboard navigation, polite live regions, optional `DataTable` alternative.
- Performance helpers: stride downsampling and marker reduction utilities.
- Optional `@kamod-ch/charts/motion` subpath for animated data updates.
- Tree-shakeable subpath exports and `@kamod-ch/charts/theme.css` semantic tokens.
- Documentation site with gallery, chart reference, playground, and API pages.

### Notes

- Requires Preact `>= 10.29`.
- Motion peers are optional; static chart imports stay motion-free.
