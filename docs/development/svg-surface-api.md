# SVG surface API (`svgProps`, `svgRef`)

Available on `Chart`, all high-level charts, and `@kamod-ch/charts/motion` wrappers.

```tsx
import { useRef } from "preact/hooks";
import { LineChart } from "@kamod-ch/charts";

export function ExportableLine() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <LineChart
      data={points}
      xKey="month"
      height={280}
      responsive
      series={[{ key: "revenue", id: "revenue" }]}
      svgRef={svgRef}
      svgProps={{
        "aria-label": "Monthly revenue",
        preserveAspectRatio: "xMidYMid meet",
        "data-dashboard": "revenue",
        onClick: () => console.log("svg click"),
      }}
    />
  );
}
```

Kamod-controlled attributes (`id`, `width`, `height`, `viewBox`, `xmlns`, `role`, `aria-labelledby`, `aria-describedby`, `data-kamod-chart-surface`) cannot be overridden via `svgProps`.

Pointer and keyboard handlers on the chart and in `svgProps` are composed: the internal handler runs first; the user handler runs once unless `defaultPrevented` is set.

## Layers, defs, and clipping

Cartesian high-level charts render with `plotLayers` (`clipped` → `foreground` → `axes`). Optional root defs and plot clipping:

```tsx
<LineChart
  data={points}
  xKey="month"
  height={280}
  series={[{ key: "revenue", id: "revenue" }]}
  clipPlotArea
  defs={
    <pattern id="my-hatch" width={4} height={4} patternUnits="userSpaceOnUse">
      <path d="M0 4 L4 0" stroke="currentColor" />
    </pattern>
  }
/>
```

`clipPlotArea` defaults to `false`. Low-level `<Chart>` children without `plotLayers` keep the previous flat plot structure.

## Custom marks (`renderPoint`, `renderBar`)

Series configs accept optional render slots; defaults match the built-in geometry.

```tsx
<LineChart
  data={points}
  xKey="month"
  height={240}
  series={[
    {
      key: "value",
      id: "revenue",
      showPoints: true,
      renderPoint: ({ x, y, color, active }) => (
        <polygon
          points={`${x},${y - 5} ${x + 5},${y} ${x},${y + 5} ${x - 5},${y}`}
          fill={color}
          stroke={active ? "var(--chart-tooltip-background)" : undefined}
        />
      ),
    },
  ]}
/>
```

`@kamod-ch/charts/motion` keeps default circle/rect geometry for animated series; custom `renderPoint` / `renderBar` apply on static charts only until motion slot parity lands.

## Axis tick collision

Cartesian charts accept `tickCollision`, `maxTickLabelLength`, `maxTickLabelWidth`, and `tickRotation` (X only). Strategies are SSR-safe (no DOM measurement):

| Strategy   | Behavior                                       |
| ---------- | ---------------------------------------------- |
| `none`     | Default; unchanged labels                      |
| `truncate` | Shorten with `…`; full text in `<title>`       |
| `hide`     | Drop overlapping middle ticks; first/last kept |
| `rotate`   | Uses `tickRotation`, or -45° on X when unset   |

```tsx
<LineChart
  data={rows}
  xKey="label"
  xScale="point"
  height={280}
  tickCollision="truncate"
  maxTickLabelLength={10}
  series={[{ key: "value", id: "v" }]}
/>
```

## Aspect ratio (responsive height)

When `responsive` is true, `aspectRatio` (width ÷ height) derives SVG height from the measured width. Explicit `height` is ignored in that case. SSR uses `initialWidth` for the first paint.

```tsx
<LineChart
  data={points}
  xKey="month"
  responsive
  initialWidth={640}
  aspectRatio={16 / 9}
  series={[{ key: "value", id: "v" }]}
/>
```

Pie and Donut accept the same layout and surface props (`class`, `style`, `aspectRatio`, `svgProps`, `svgRef`, `defs`, accessibility fields). They do **not** accept cartesian-only `clipPlotArea` or `tickCollision` props.

## Surface parity (all high-level charts)

`@kamod-ch/charts/motion` re-exports the same `*ChartProps` types as the static charts.

| Feature                                                 | Cartesian | Pie / Donut |
| ------------------------------------------------------- | --------- | ----------- |
| `clipPlotArea`, `tickCollision`, tick sizing / rotation | yes       | no          |
| `aspectRatio` with `responsive`                         | yes       | yes         |
| SVG export via `svgRef` + `@kamod-ch/charts/export`     | yes       | yes         |
