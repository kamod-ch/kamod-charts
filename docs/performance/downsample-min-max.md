# Min/max downsampling

`downsampleMinMax` preserves local extrema per bucket for monotonic numeric X series. It returns `{ datum, index }` pairs referencing the original rows.

## When to use

- Large line charts where stride sampling would flatten spikes.
- Not enabled automatically on any chart; call explicitly before passing data or inside custom series pipelines.

## Rules

- `budget` is the maximum number of distinct original indices (endpoints included when budget allows).
- Gaps (`null` / non-finite Y) are skipped; contiguous gap handling follows stride semantics in the core series renderer.
- Unsorted X data: caller must sort or use stride fallback; the helper does not reorder input.

## Export

```ts
import { downsampleMinMax } from "@kamod-ch/charts/performance";
```

See `packages/core/tests/downsample-min-max.test.ts` for regression cases.
