# Changelog

All notable changes to `@kamod-ch/charts` are documented here.

## Unreleased

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

### Fixed

- **Reference lines:** decorative reference lines now set `aria-hidden="true"` consistently with reference areas and points.
- **Area charts:** stacked areas now honor `curve` and `outline` (previously ignored on `StackedAreaSeries`).
- **Area charts:** `basis` curve no longer falls back to `linear` for area paths.

### Notes

- **Backward compatible / additive:** existing `LineChart` usage requires no migration. New props (`stacked`, `referenceAreas`, `referencePoints`, per-series styles) are optional; defaults preserve prior behaviour (`stacked` defaults to `false`, curve defaults to `linear`).
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
