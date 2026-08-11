# RFC 0002: Phase 1 Core, Layout, and Responsive Container

Status: Implemented  
Phase: 1  
Date: 2026-08-11

## Implemented scope

Phase 1 establishes the package foundation and the reusable chart core. It intentionally does not implement axes, scales, grid, series, or high-level chart types.

Implemented:

- pnpm workspace root.
- Publishable package `@kamod-ch/charts` under `packages/charts`.
- Strict TypeScript and Preact JSX configuration.
- ESM build via `tsup`.
- Public core types.
- Accessor normalization helpers.
- `ChartRoot` and `Chart` alias.
- Chart context and `useChartContext`.
- SVG `ChartSurface`.
- Plot area margin calculation.
- Fixed and responsive dimensions.
- SSR-safe `ResizeObserver` usage after mount.
- Stable accessibility IDs with user-controlled `id` support.
- Basic theme tokens in `src/theme/tokens.css`.
- Empty-state SVG text.
- Unit and SSR/component tests for the implemented behavior.

## Deferred scope

Deferred to later phases:

- D3 dependencies and scale factories.
- Axes, ticks, and grid.
- Series primitives.
- Tooltips, legend, pointer state, keyboard navigation, and live regions.
- Data-table accessibility alternative.
- Animation and reduced-motion behavior.
- High-level chart components.

## Acceptance criteria mapping

- Deterministic SSR: covered by `chart-ssr.test.tsx` with fixed dimensions and responsive `initialWidth`.
- No unguarded browser APIs: responsive measurement is inside `useEffect` and guarded by `globalThis.ResizeObserver` checks.
- Hydration mismatch prevention: responsive initial render uses `initialWidth` before measurement.
- Responsive resize: covered by `responsive-container.test.tsx` with a mock `ResizeObserver`.
- Generic types: `ChartRootProps<TDatum>`, `DataAccessor<TDatum, TValue>`, `ChartSeries<TDatum>`, and `ChartInteraction<TDatum>` are public.
- Theme tokens: `./theme.css` is exported and copied into `dist/theme/tokens.css`.

## Phase 2 entry criteria

Before starting Phase 2, this package should remain green for:

```sh
pnpm check
```

Phase 2 can then add only the required modular D3 dependencies for scales, ticks, and formatting.
