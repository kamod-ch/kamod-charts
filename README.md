# @kamod-ch/charts

Preact-native, SVG-first chart components for Kamod applications.

## Status

`v0.1.0` release candidate. Do not publish until the release checklist is explicitly approved.

## Install

```sh
pnpm add @kamod-ch/charts preact
```

Import theme tokens once:

```ts
import "@kamod-ch/charts/theme.css";
```

## Quick start

```tsx
import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="date"
  xScale="time"
  series={[{ key: "revenue", label: "Umsatz", color: "var(--chart-1)" }]}
  height={320}
  initialWidth={640}
  responsive
  showGrid
  showLegend
  tooltip
/>;
```

Composable API:

```tsx
import { Chart, Grid, LineSeries, ReferenceLine, Tooltip, XAxis, YAxis } from "@kamod-ch/charts";

<Chart data={data} xKey="date" xScale="time" height={320}>
  <Grid yKey="revenue" />
  <XAxis />
  <YAxis dataKey="revenue" />
  <LineSeries dataKey="revenue" />
  <ReferenceLine y={1000} yKey="revenue" label="Ziel" />
</Chart>;
```

## Runtime policy

- Preact only.
- No React, React DOM, or `preact/compat`.
- SVG DOM is owned by Preact.
- D3 is used only through modular computation packages.
