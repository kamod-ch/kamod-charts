# RFC 0004: Phase 3 LineChart and ScatterChart

Status: Implemented  
Phase: 3  
Date: 2026-08-11

## Implemented scope

Phase 3 adds the first cartesian series and high-level charts on top of the Phase 1/2 core.

Implemented:

- `d3-shape` as a modular computation dependency for line path generation.
- Shared cartesian helpers for x/y scale creation and point projection.
- Combined y-domain inference across visible high-level series.
- `LineSeries` low-level SVG series primitive.
- `ScatterSeries` low-level SVG series primitive.
- `ReferenceLine` primitive for x/y reference markers.
- High-level `LineChart` with multiple series, grid/axes composition, reference lines, missing-value handling, `connectNulls`, optional/auto markers, and configurable curves.
- High-level `ScatterChart` with multiple series, configurable point size and color, grid/axes composition, reference lines, and active point rendering.
- Basic chart-level keyboard navigation:
  - Arrow left/right changes active point.
  - Arrow up/down changes active series.
  - Home/End jumps to first/last point.
  - Enter/Space invokes selection callback internally for future extension.
  - Escape clears back to the first active point for now.
- Simple nearest-point helper for later pointer interaction.

## Public exports added

- `@kamod-ch/charts/line`
- `@kamod-ch/charts/scatter`
- `@kamod-ch/charts/series`
- `@kamod-ch/charts/interaction`

The root export also re-exports charts, series, and interaction helpers.

## API notes

High-level line usage:

```tsx
<LineChart
  data={data}
  xKey="date"
  xScale="time"
  series={[{ key: "revenue", label: "Umsatz", color: "var(--chart-1)" }]}
  height={320}
  showGrid
/>
```

Composable usage is supported with chart-level x-axis configuration:

```tsx
<Chart data={data} xKey="date" xScale="time" height={320}>
  <Grid yKey="revenue" />
  <XAxis />
  <YAxis dataKey="revenue" />
  <LineSeries dataKey="revenue" />
  <ReferenceLine y={1000} yKey="revenue" label="Ziel" />
</Chart>
```

`Chart` now accepts optional `xKey` and `xScale` so low-level axes and series can share x-axis semantics without an imperative registry.

## Deferred scope

Deferred to later phases:

- HTML tooltip and pointer/touch interactions.
- Shared tooltip and nearest-x behavior.
- Legend and series toggling.
- Controlled/uncontrolled external selection API.
- Full screenreader live-region announcements.
- Scatter quadtree/Delaunay optimization.
- Downsampling and large-data warnings.
- Area/Bar/Pie chart types.

## Design notes

- Series render only SVG elements through Preact.
- `d3-shape` is used only to compute path `d` strings.
- Low-level series create their own scales from chart data and props; high-level charts pass a shared y-domain to avoid inconsistent series scaling.
- Markers default to auto and are rendered only up to 500 points for line series.
- Missing numeric values are not coerced to zero. They produce gaps unless `connectNulls` is enabled.

## Acceptance criteria mapping

- High-level and low-level APIs work: covered by SSR tests for `LineChart`, `ScatterChart`, and composable `Chart` usage.
- No duplicated layout foundation: both charts use `Chart`, axes, grid, reference lines, and shared cartesian helpers.
- Generic datatypes remain: chart and series props remain generic over `TDatum`.
- SSR rendering produces SVG: covered by render-to-string tests.
- Basic keyboard navigation: covered by component test firing ArrowRight against the chart SVG.

## Phase 4 entry criteria

Before Phase 4, the package is green for:

```sh
pnpm check
```

Phase 4 should reuse the cartesian helpers and extract stack/domain logic for AreaChart and BarChart rather than duplicating high-level domain aggregation.
