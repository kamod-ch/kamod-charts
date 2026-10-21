# Time-series streaming (Prompt 09)

Renderer-independent ingest lives in `TimeSeriesBuffer`; charts still receive ordinary `data` arrays.

## Buffer

```ts
const buffer = new TimeSeriesBuffer({
  capacity: 5_000,
  readTime: (row) => row.t.getTime(),
  retentionMs: 30 * 60_000,
  duplicatePolicy: "reject", // reject | replace | allow
  outOfOrderPolicy: "reorder-window", // reject | drop | reorder-window
  reorderWindowMs: 60_000,
});
buffer.append(batch);
const { items, domain, clippedStart } = buffer.viewTrailing(5 * 60_000);
```

Late points are never silently re-sorted globally: `reorder-window` only inserts within the configured span.

## Sparkline preset

`Sparkline` is a thin `LineChart` wrapper (minimal margins, no grid/legend/tooltip) for KPI strips. Export: `@kamod-ch/charts` (`Sparkline`, `SparklineProps`). Example: [Monitoring demo](/examples/monitoring).

## Preact adapter

`useTimeSeriesBuffer` appends immediately (bounded buffer) but refreshes `view.data` / `view.xDomain` on rAF while **live**.

| Mode     | Ingest      | Chart updates                                                              |
| -------- | ----------- | -------------------------------------------------------------------------- |
| `live`   | yes, capped | trailing window follows newest timestamp                                   |
| `paused` | yes, capped | frozen at pause anchor; `historyTruncated` when anchor falls off retention |

`resumeLive()` jumps back to the newest trailing window. No WebSocket code in core — apps push batches from any transport.

## Long browser run (manual)

From `kamod-charts`:

```bash
pnpm --filter @kamod-ch/charts-browser-fixture build
pnpm --filter @kamod-ch/charts-browser-fixture preview
# open /?page=streaming, leave running, navigate away to confirm timers stop
```

Optional `performance.memory.usedJSHeapSize` is Chromium-specific and not a universal leak proof; use it only as an environment hint.
