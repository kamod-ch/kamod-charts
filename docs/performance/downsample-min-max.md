# Min/max downsampling

## `downsampleMinMax`

Preserves local extrema per bucket for monotonic numeric X series. Returns `{ datum, index }` pairs referencing the original rows.

### When to use

- Large line charts where stride sampling would flatten spikes.
- Not enabled automatically on any chart; call explicitly before passing data or inside custom series pipelines.

### Rules

- `budget` is the maximum number of distinct original indices (endpoints included when budget allows).
- Invalid Y values are **skipped** inside the helper (legacy behaviour); contiguous rendering gaps follow `connectNulls` in the series renderer.
- Unsorted X data: caller must sort or accept array-order semantics; the helper does not reorder input.

## `downsampleMinMaxSegmented`

Segment-preserving variant for monitoring-style series with explicit null/NaN gaps and optional time gaps.

### Rules

- **Budget** counts drawable numeric points (finite X and Y) only. Segment metadata (`segments`, gap indices) is separate and does not consume budget.
- Invalid or missing **Y** breaks a segment; points are never connected across value gaps.
- **`gapThreshold`** (optional, explicit): when set, splits segments when X increases by more than the threshold between consecutive valid rows in **array order**. The library does not infer an interval from the data.
- Tight budgets: endpoints are reserved per segment in order; leftover budget is distributed deterministically by segment size. Segments are never merged.
- **Unsorted** or duplicate X values are left in place; the helper does not mutate input.
- **Stacking**: downsample each series independently; do not min/max stacked totals unless you implement a coordinated pipeline.
- **`connectNulls`**: only affects rendering when enabled on the chart; downsampling does not bridge gaps.

### Export

```ts
import { downsampleMinMax, downsampleMinMaxSegmented } from "@kamod-ch/charts/performance";
```

See `packages/core/tests/downsample-min-max.test.ts` and `downsample-min-max-segmented.test.ts`.
