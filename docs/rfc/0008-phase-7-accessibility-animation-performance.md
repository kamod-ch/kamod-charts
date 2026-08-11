# RFC 0008: Phase 7 Accessibility, Animation, and Performance

Status: Implemented  
Phase: 7  
Date: 2026-08-11

## Implemented scope

Phase 7 deepens non-chart-type foundations.

Implemented:

- Accessible `DataTable` alternative for chart data.
- Chart description helper.
- Focus-visible styling for chart SVGs.
- High-contrast CSS media handling.
- Reduced-motion CSS media handling.
- SSR-safe `prefersReducedMotion` helper and `useReducedMotion` hook.
- Animation utility primitives:
  - `interpolateValue`
  - `shouldAnimate`
- Performance helpers:
  - `downsampleByStride`
  - `shouldReduceMarkers`
  - `getLargeDatasetWarning`
  - `bisectDate`
- Performance target documentation for 100, 500, 1,000, 2,000, and 10,000 points.

## Public exports added

- `@kamod-ch/charts/accessibility`
- `@kamod-ch/charts/animation`
- `@kamod-ch/charts/performance`

The root export also re-exports these helpers.

## Design notes

- Accessibility additions are SSR-safe and do not rely on browser APIs.
- Reduced-motion detection is guarded and defaults to no reduced motion during SSR.
- `d3-interpolate` is used only for value/string interpolation.
- Current downsampling is deterministic stride-based. It is intentionally simple and documented as a baseline, not a publication-quality signal-preserving algorithm.

## Deferred scope

Deferred to Phase 8/release hardening:

- Full accessibility audit and browser-level a11y tests.
- Complete docs pages and examples.
- Bundle-size report.
- Playwright browser performance benchmarks.
- Advanced line downsampling such as LTTB/min-max buckets.
- Delaunay/quadtree scatter hit testing.

## Acceptance criteria mapping

- Data alternative as HTML table: implemented via `DataTable`.
- Focus management: chart-level focus existed; focus-visible CSS added.
- High contrast: CSS media handling added.
- Reduced motion: CSS and SSR-safe helpers added.
- Animation primitives: interpolation and `shouldAnimate` added.
- Performance: benchmark targets documented; downsampling and binary-search helpers added and tested.

## Phase 8 entry criteria

Before Phase 8, the package is green for:

```sh
pnpm check
```

Phase 8 should focus on documentation, examples, package-export tests, bundle size, and release checklist for `v0.1.0` without publishing.
