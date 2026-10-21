# Browser benchmarks (informative)

Method:

- **Navigation → initial-ready:** `performance.timeOrigin` navigation `fetchStart` until fixture records initial-ready after **two** `requestAnimationFrame` callbacks (DOM commit observation point, not GPU/paint timing).
- **Update:** runner calls `triggerUpdate(seed)` only after initial-ready; **update duration** is `updateCompleteAt - updateStartAt` where complete uses the same double-rAF boundary after `setData`.
- Missing or invalid timings are omitted from aggregates (not reported as `0`). Raw rows: [browser-benchmarks.raw.json](./browser-benchmarks.raw.json).

Chromium bundled, viewport 1280×720, reduced motion, 5 samples (+1 warmup).

Reproduce:

```sh
pnpm --filter @kamod-ch/charts-browser-fixture build
pnpm --filter @kamod-ch/charts-browser-fixture preview
node scripts/browser-benchmark.mjs
```

| Chart        | Raw points | Visible points | Ready median ms | Ready p95 ms | Update median ms | Update p95 ms |
| ------------ | ---------: | -------------: | --------------: | -----------: | ---------------: | ------------: |
| line         |        100 |            100 |            42.1 |      44.5 \* |             16.7 |       30.6 \* |
| line         |        500 |            500 |            71.5 |      79.6 \* |             27.2 |       31.3 \* |
| line         |       2000 |           2000 |            41.3 |      46.9 \* |             27.0 |       33.5 \* |
| line         |      10000 |          10000 |            56.7 |      70.4 \* |             37.6 |       47.0 \* |
| stacked-line |        100 |            100 |            29.6 |      45.6 \* |              9.9 |       29.4 \* |
| stacked-line |        500 |            500 |            61.2 |      85.6 \* |             21.3 |       31.9 \* |
| stacked-line |       2000 |           2000 |            29.9 |      44.7 \* |             20.2 |       26.6 \* |
| stacked-line |      10000 |          10000 |            77.4 |      99.0 \* |             35.8 |       42.0 \* |
| bar          |        100 |             25 |            42.4 |      57.4 \* |             24.2 |       30.4 \* |
| bar          |        500 |             25 |            44.1 |      44.9 \* |             26.1 |       33.5 \* |
| bar          |       2000 |             25 |            51.4 |      69.9 \* |             24.7 |       30.9 \* |
| bar          |      10000 |             25 |            44.2 |      56.6 \* |             27.4 |       32.2 \* |
| scatter      |        100 |            100 |            41.4 |      56.8 \* |             17.5 |       32.3 \* |
| scatter      |        500 |            500 |            47.1 |      50.1 \* |             25.4 |       33.5 \* |
| scatter      |       2000 |           2000 |           105.1 |     131.0 \* |             98.6 |      126.6 \* |
| scatter      |      10000 |          10000 |           386.3 |     418.8 \* |           1341.2 |     1503.3 \* |

- p95 with few samples is a coarse estimate.
