# Browser benchmarks (informative)

Method: navigation start → `performance.now()` when the fixture calls `markReady()` after first paint hook;
data update measures `markUpdated()` after a zero-delay state refresh. **Not** layout/paint timing.

Chromium bundled, viewport 1280×720, reduced motion, 5 samples (+1 warmup).

Reproduce:

```sh
pnpm --filter @kamod-ch/charts-browser-fixture build
pnpm --filter @kamod-ch/charts-browser-fixture preview
node scripts/browser-benchmark.mjs
```

| Chart        | Points | Ready median ms | Ready p95 ms | Update median ms | Update p95 ms |
| ------------ | -----: | --------------: | -----------: | ---------------: | ------------: |
| line         |    100 |            17.4 |         33.1 |             -1.7 |          -1.5 |
| line         |    500 |            35.0 |         40.7 |             -3.9 |          -3.4 |
| line         |   2000 |            26.0 |         28.3 |             -6.4 |          -4.4 |
| line         |  10000 |            61.6 |         74.0 |            -22.3 |         -15.6 |
| stacked-line |    100 |            21.5 |         29.5 |             -1.6 |           0.2 |
| stacked-line |    500 |            31.6 |         45.6 |             -4.1 |          -3.9 |
| stacked-line |   2000 |            22.7 |         33.4 |             -4.8 |          -4.6 |
| stacked-line |  10000 |            70.6 |         81.7 |            -24.9 |         -22.4 |
| bar          |    100 |            28.1 |         40.1 |            -13.7 |          -1.3 |
| bar          |    500 |            18.0 |         28.4 |             -4.5 |          -0.8 |
| bar          |   2000 |            26.8 |         27.6 |             -3.9 |          -0.9 |
| bar          |  10000 |            16.7 |         31.2 |             -1.5 |          -0.9 |
| scatter      |    100 |            30.7 |         38.1 |            -14.6 |          -3.2 |
| scatter      |    500 |            37.8 |         58.6 |            -10.0 |          -8.1 |
| scatter      |   2000 |           115.7 |        144.4 |            -43.7 |           1.8 |
| scatter      |  10000 |           986.9 |       1143.4 |           -712.6 |           5.8 |

Target to validate (not a guarantee): p95 ready &lt; 16 ms at 2 000 points on a dev machine.
