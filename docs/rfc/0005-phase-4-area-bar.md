# RFC 0005: Phase 4 AreaChart and BarChart

Status: Implemented  
Phase: 4  
Date: 2026-08-11

## Implemented scope

Phase 4 adds Area and Bar chart support on top of the existing cartesian core.

Implemented:

- `AreaSeries` low-level SVG series primitive.
- `StackedAreaSeries` internal/public series primitive for stacked areas.
- `BarSeries` low-level SVG series primitive.
- `AreaChart` high-level chart.
- `BarChart` high-level chart.
- Shared stack/domain utilities:
  - `getStackedValues`
  - `inferStackedDomain`
  - `inferGroupedDomain`
- Positive and negative value handling for grouped and stacked domains.
- Area baseline support.
- Area opacity and optional outline.
- Stacked areas.
- Vertical bars.
- Horizontal bar rendering.
- Grouped bars.
- Stacked bars.
- Rounded bar corners via SVG path generation.
- Value labels.
- Minimum visible bar size.
- Click callbacks for bars.

## Public exports added

- `@kamod-ch/charts/area`
- `@kamod-ch/charts/bar`

Root and `@kamod-ch/charts/series` exports now include the new area/bar series and shared stack helpers.

## Design notes

- The stack/domain logic is shared between `AreaChart` and `BarChart` through `series/stack.ts`.
- Missing numeric values are treated as `0` only in stacked aggregate rendering, because a stack segment needs a defined baseline. Low-level line/area behavior still preserves gaps where appropriate.
- Bars are rendered as SVG `<path>` elements so rounded corners can work consistently without imperative DOM manipulation.
- Area paths still use `d3-shape` only for path-string calculation.
- Preact owns all SVG elements.

## Deferred scope

Deferred to later phases:

- Fully orientation-aware axes for horizontal bar charts.
- Advanced stack offsets/orderings.
- Gradient fill primitives.
- Controlled selection state for bars.
- Pointer/touch tooltip integration.
- Legend-driven series visibility.
- Collision-aware value-label placement.

## Acceptance criteria mapping

- AreaChart simple and multiple areas: covered by SSR tests.
- Area baseline, opacity, outline: implemented as `AreaChart`/`AreaSeries` props.
- Positive/negative values and stacked areas: covered by stack-domain logic and SSR tests.
- BarChart vertical, horizontal, grouped, stacked: rendered and covered by tests.
- Rounded corners, value labels, min visible bar size, click callbacks: implemented and covered by tests.
- Shared stack/domain logic: `series/stack.ts` is reused by Area and Bar charts.

## Phase 5 entry criteria

Before Phase 5, the package is green for:

```sh
pnpm check
```

Phase 5 should add Pie/Donut using `d3-shape` only for pie angles and arc path calculations, while keeping all segments Preact-rendered.
