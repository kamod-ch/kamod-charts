# SVG export (`@kamod-ch/charts/export`)

Tree-shakeable helpers for serializing the rendered chart `<svg>` and triggering a browser download. The module is safe to import during SSR; browser APIs are only used when you call an export function.

```tsx
import { useRef } from "preact/hooks";
import { LineChart } from "@kamod-ch/charts";
import { downloadChartSvg, serializeChartSvg } from "@kamod-ch/charts/export";

export function DownloadableChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <>
      <LineChart
        data={points}
        xKey="month"
        height={280}
        series={[{ key: "revenue", id: "revenue" }]}
        svgRef={svgRef}
      />
      <button
        type="button"
        onClick={() => {
          if (svgRef.current) {
            downloadChartSvg(svgRef.current, "revenue.svg", {
              embedStyles: "kamod-tokens",
            });
          }
        }}
      >
        Download SVG
      </button>
    </>
  );
}
```

## API

- `serializeChartSvg(svgElement, options?)` → SVG markup string (clone; does not mutate the live DOM).
- `downloadChartSvg(svgElement, filename, options?)` → creates an `image/svg+xml` blob download.

### Options

| Option            | Default        | Description                                                                                                                                                                                                                   |
| ----------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `embedStyles`     | `kamod-tokens` | Inline `--kamod-*` and `--chart-*` from computed styles (nearest element wins over ancestors). `all-computed` also inlines a bounded set of SVG/text properties per element plus `--*` tokens. `none` skips token collection. |
| `backgroundColor` | transparent    | Inserts a full-size background `<rect>` on the clone only.                                                                                                                                                                    |
| `inlineStyle`     | —              | Extra inline declarations on the cloned root `<svg>`.                                                                                                                                                                         |
| `revokeDelayMs`   | `60000`        | Download-only: delay before `URL.revokeObjectURL`.                                                                                                                                                                            |

## PNG raster export

Raster export is a **separate subpath** so normal chart bundles do not pull canvas rasterization code:

```ts
import { downloadChartPng, renderChartToPngBlob } from "@kamod-ch/charts/export/png";
```

`renderChartToPngBlob` calls `serializeChartSvg` internally, then draws the SVG to an off-screen canvas. Options include `scale`, `devicePixelRatio`, `maxDimension` (default 8192), and `backgroundColor`. Empty or zero-sized SVG dimensions throw explicit errors; cross-origin assets may produce a tainted-canvas error.

## Chart data CSV

See [chart-data-csv.md](./chart-data-csv.md) for `serializeChartDataCsv` / `downloadChartDataCsv` on original chart rows.

## Limits

- External web fonts, linked stylesheets, and cross-origin images are not inlined. Exports may look incomplete under strict CSP or without embedded fonts.
- PNG export inherits the same external asset limits; rasterization can fail when the SVG references blocked cross-origin images.
