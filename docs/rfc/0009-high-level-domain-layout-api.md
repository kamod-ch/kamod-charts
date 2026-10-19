# RFC 0009 — High-level domain & layout API (cartesian charts)

## Status

Accepted for incremental rollout on finished cartesian charts (`LineChart`, `AreaChart`, `BarChart`, `ScatterChart`).

## Goals

- Explicit `yDomain` (and later `xDomain` where valid) overrides inference.
- `margin`, `class`, `style`, and `emptyContent` pass through to the chart shell.
- `format` bundles locale/timezone/number options (see `ChartFormatOptions`).
- One effective domain drives axis, grid, series projection, annotations, and hit-testing.

## Precedence

1. Explicit `yDomain` prop wins over inferred domain.
2. Legend toggles affect visible series geometry but must not shrink a fixed `yDomain`.
3. Custom axis formatters override `format` defaults; `format` overrides built-in `Intl` defaults.

## Types (additive)

```ts
export interface ChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ChartFormatOptions {
  locale?: string;
  timeZone?: string;
  number?: Intl.NumberFormatOptions;
}

export interface CommonCartesianChartProps<TDatum> {
  yDomain?: readonly [number, number];
  margin?: ChartMargin;
  class?: string;
  style?: string | Record<string, string | number>;
  emptyContent?: ComponentChildren;
  format?: ChartFormatOptions;
  activeIndex?: number | null;
  onActiveChange?: (selection: CartesianActiveSelection) => void;
}
```

## Defaults

- Missing `yDomain`: current inference per chart kind (unchanged).
- Missing `emptyContent`: existing empty-state behaviour.
- Missing `format`: `undefined` locale (runtime default), UTC geometry for time scales.

## Example

```tsx
<LineChart
  data={rows}
  xKey="date"
  xScale="time"
  yDomain={[0, 100]}
  format={{ locale: "de-CH", timeZone: "Europe/Zurich" }}
  emptyContent={<p>No data for this range.</p>}
  series={[{ key: "value", label: "Views" }]}
  height={320}
/>
```

## Non-goals (this RFC)

- Second Y axis / combo charts.
- Automatic min/max downsampling on render.
