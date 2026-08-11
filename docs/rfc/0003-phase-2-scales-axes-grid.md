# RFC 0003: Phase 2 Scales, Axes, and Grid

Status: Implemented  
Phase: 2  
Date: 2026-08-11

## Implemented scope

Phase 2 adds the mathematical and SVG-rendered axis foundation for later chart series.

Implemented:

- Modular D3 dependencies for computation only:
  - `d3-array`
  - `d3-format`
  - `d3-scale`
  - `d3-time-format`
- Numeric, time, band, and point scale factories.
- Automatic numeric, time, and categorical domain inference.
- Explicit domains.
- Domain padding for continuous domains.
- One-point continuous domain expansion.
- Optional nice domains on linear/time scales.
- Tick value extraction.
- Number and date tick formatting.
- `XAxis` rendered declaratively by Preact SVG.
- `YAxis` rendered declaratively by Preact SVG.
- `Grid` rendered declaratively by Preact SVG.
- Axis labels and x tick rotation.
- Empty-data-safe domain fallbacks.

## Public exports added

- `@kamod-ch/charts/axes`
- `@kamod-ch/charts/scales`
- `@kamod-ch/charts/primitives`

The root export also re-exports axes, scales, and primitives.

## Deferred scope

Deferred to later phases:

- Scale registration in context for series reuse.
- Collision-aware tick skipping beyond basic rotation support.
- Series-level domain aggregation.
- Reference lines.
- High-level chart components.
- Tooltip/legend interactions.

## Design notes

- D3 is used only for pure calculations. No `d3-selection`, no `d3-axis`, and no full `d3` package are used.
- Axes and grid are SVG components owned by Preact.
- Public chart APIs still avoid requiring users to pass D3-specific objects for common usage.
- `YAxis` without a `dataKey` falls back to `[0, 1]`; later series-aware charts will derive this from visible series.
- Categorical values are normalized to strings to support stable SVG keys and D3 band/point domains.

## Acceptance criteria mapping

- No D3 selection: source imports are limited to modular calculation packages.
- No imperative axis rendering: axes and grid are JSX/SVG components.
- Negative values: covered by numeric-domain and axis SSR tests.
- Empty data: continuous scales fall back to safe domains and categorical domains to `[]`.
- One-point domains: continuous domains expand around the single value.
- Time axes: covered by SSR tests with date formatting.
- Band axes: covered by SSR tests with categorical ticks.

## Phase 3 entry criteria

Before Phase 3, the package is green for:

```sh
pnpm check
```

Phase 3 should build line and scatter series on top of the existing `Chart` core, domain helpers, axes, and grid without duplicating layout logic.
