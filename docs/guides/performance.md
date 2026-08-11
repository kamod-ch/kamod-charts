# Performance

Targets:

- 500 points: fully interactive SVG.
- 2,000 points: practical upper target for dense SVG interaction.
- 10,000 points: use downsampling or reduced interactivity.

Helpers:

```ts
import { downsampleByStride, shouldReduceMarkers } from "@kamod-ch/charts/performance";
```

See `docs/performance/svg-dashboard-targets.md` for details.
