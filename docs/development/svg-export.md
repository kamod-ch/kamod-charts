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

| Option            | Default        | Description                                                                                                          |
| ----------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `embedStyles`     | `kamod-tokens` | Inline `--kamod-*` and `--chart-*` custom properties from computed styles. Use `all-computed` or `none` when needed. |
| `backgroundColor` | transparent    | Inserts a full-size background `<rect>` on the clone only.                                                           |
| `inlineStyle`     | —              | Extra inline declarations on the cloned root `<svg>`.                                                                |
| `revokeDelayMs`   | `60000`        | Download-only: delay before `URL.revokeObjectURL`.                                                                   |

## Limits

- External web fonts, linked stylesheets, and cross-origin images are not inlined. Exports may look incomplete under strict CSP or without embedded fonts.
- Raster/PNG export is not part of this entry (optional roadmap prompt 08).
