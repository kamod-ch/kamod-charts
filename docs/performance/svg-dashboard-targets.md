# SVG dashboard performance targets

`@kamod-ch/charts` optimizes first for SSR-safe SVG dashboards.

## Current targets

| Points | Expected behavior                                                |
| ------ | ---------------------------------------------------------------- |
| 100    | Fully interactive SVG, markers enabled.                          |
| 500    | Fully interactive SVG, markers still acceptable.                 |
| 1,000  | Interactive SVG, prefer reduced marker density for dense charts. |
| 2,000  | Upper target for responsive pointer interactions.                |
| 10,000 | Require downsampling or reduced interactivity.                   |

## Current helpers

- `shouldReduceMarkers(pointCount, markerThreshold)` defaults to reducing markers above 500 points.
- `downsampleByStride(data, { threshold })` provides deterministic stride-based downsampling and preserves the last datum.
- `getLargeDatasetWarning(pointCount)` documents when consumers should downsample or disable markers.
- `bisectDate(data, target, accessor)` supports sorted time-series nearest-index work.

## Roadmap

Later versions should add:

- LTTB or min/max bucket downsampling for line charts.
- Quadtree or Delaunay nearest-point lookup for scatter charts.
- Optional Canvas renderer for very large point clouds.
- Browser benchmarks in Playwright for pointer latency and render cost.
